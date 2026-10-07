import { honeypotResponse, honeypotTriggered, ok, requestMeta, route, validate } from "@/server/utils/http";
import { formLimiter, rateLimit } from "@/server/utils/rateLimit";
import { parseResumeUpload } from "@/server/utils/upload";
import { applicationSchema } from "@/server/validators/leads";
import { submitApplication } from "@/server/services/application.service";

/**
 * POST /api/applications — multipart/form-data job application.
 * The file is parsed & content-sniffed before the text fields are validated.
 */
export const POST = route(async (req) => {
  rateLimit(formLimiter, req);
  const { fields, file } = await parseResumeUpload(req);
  if (honeypotTriggered(fields, req)) return honeypotResponse();
  const data = validate(applicationSchema, fields);
  const application = await submitApplication(data, file, requestMeta(req));
  return ok(
    { id: application.id },
    { status: 201, message: "Application received! Our team reviews every application and will reply within 5 working days." },
  );
});
