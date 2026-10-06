import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { formLimiter, honeypot } from "../middleware/spamProtection.js";
import { applicationSchema, contactSchema, consultationSchema, healthCheckupSchema, leadMagnetSchema } from "../validators/leads.js";
import { resumeUpload } from "../middleware/upload.js";
import { submitCheckup, submitConsultation, submitContact, submitJobApplication, submitLeadMagnet } from "../controllers/lead.controller.js";
import { contentController } from "../controllers/content.controller.js";
import { contentService } from "../services/content.service.js";
import { Service } from "../models/Service.js";
import { Project } from "../models/Project.js";
import { Post } from "../models/Post.js";
import { Job } from "../models/Career.js";
import { dbState } from "../config/db.js";
import { sendSuccess } from "../utils/http.js";

/**
 * All /api routes in one readable table.
 * Form routes run: rate limit → honeypot → validation → controller.
 */
const router = Router();

/* Health — used by uptime monitors and to wake a sleeping free-tier host. */
router.get("/health", (_req, res) =>
  sendSuccess(res, { message: "ok", data: { uptime: Math.round(process.uptime()), db: dbState() } }),
);

/* Lead capture */
router.post("/contact", formLimiter, honeypot, validate(contactSchema), submitContact);
router.post("/consultation", formLimiter, honeypot, validate(consultationSchema), submitConsultation);
router.post("/health-checkup", formLimiter, honeypot, validate(healthCheckupSchema), submitCheckup);
router.post("/lead-magnet", formLimiter, honeypot, validate(leadMagnetSchema), submitLeadMagnet);
// multipart/form-data: file is parsed & sniffed before the text fields are validated
router.post("/applications", formLimiter, resumeUpload, honeypot, validate(applicationSchema), submitJobApplication);

/* Content (read-only, consumed by the Next.js data layer with ISR) */
const services = contentController(contentService(Service, "Service"));
const projects = contentController(contentService(Project, "Project"));
router.get("/services", services.list);
router.get("/services/:slug", services.detail);
router.get("/projects", projects.list);
router.get("/projects/:slug", projects.detail);

const postsApi = contentController(contentService(Post, "Post"));
router.get("/posts", postsApi.list);
router.get("/posts/:slug", postsApi.detail);

const jobsApi = contentController(contentService(Job, "Job", { open: true }));
router.get("/jobs", jobsApi.list);
router.get("/jobs/:slug", jobsApi.detail);

export default router;
