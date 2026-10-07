import { ok } from "@/server/utils/http";
import { formRoute } from "@/server/utils/forms";
import { consultationSchema } from "@/server/validators/leads";
import { createConsultationRequest } from "@/server/services/lead.service";

/** POST /api/consultation — "Book a Free Consultation" → ConsultationRequest (+ team email). */
export const POST = formRoute(consultationSchema, async (data, meta) => {
  const request = await createConsultationRequest(data, meta);
  return ok(
    { id: request.id },
    { status: 201, message: "Your consultation request is in! We'll confirm your slot by email shortly." },
  );
});
