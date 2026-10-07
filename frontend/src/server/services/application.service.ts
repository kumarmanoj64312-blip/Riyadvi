import { CareerApplication, Job } from "../models/Career";
import { deleteResume, saveResume, type ResumeFile } from "./resumeStorage.service";
import { notifyTeamInBackground } from "./notification.service";
import { ApiError } from "../utils/errors";
import type { ApplicationInput } from "../validators/leads";
import type { RequestMeta } from "./lead.service";

/**
 * Job application: verify the role → store resume in GridFS → save the
 * application. If saving the document fails, the uploaded file is removed so
 * GridFS never accumulates orphaned resumes.
 */
export async function submitApplication(data: ApplicationInput, file: Required<ResumeFile>, meta: RequestMeta) {
  const job = await Job.findOne({ slug: data.jobSlug, open: true, published: true });
  if (!job) throw ApiError.badRequest("This position is no longer open.", [{ field: "jobSlug", message: "Position not available." }]);

  const fileId = await saveResume(file, { jobSlug: job.slug, applicantEmail: data.email });
  try {
    const application = await CareerApplication.create({
      job: job._id,
      position: job.title,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      resume: { fileId, filename: file.originalname.slice(0, 120), contentType: file.mimetype, size: file.size },
      userAgent: meta.userAgent,
    });

    notifyTeamInBackground(
      `New application: ${data.name} — ${job.title}`,
      {
        Position: job.title,
        Name: data.name,
        Email: data.email,
        Phone: data.phone,
        Message: data.message || "—",
        Resume: `${file.originalname} (${Math.round(file.size / 1024)} KB) — download from the admin dashboard`,
      },
      data.email,
    );
    return application;
  } catch (err) {
    await deleteResume(fileId).catch(() => {});
    throw err;
  }
}
