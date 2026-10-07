import { ok } from "@/server/utils/http";
import { formRoute } from "@/server/utils/forms";
import { healthCheckupSchema } from "@/server/validators/leads";
import { submitHealthCheckup } from "@/server/services/healthCheckup.service";

/** POST /api/health-checkup — validated against the questionnaire, scored, stored. */
export const POST = formRoute(healthCheckupSchema, async (data, meta) => {
  const result = await submitHealthCheckup(data, meta);
  return ok(result, { status: 201, message: "Your Business Health Checkup is complete — here are your results." });
});
