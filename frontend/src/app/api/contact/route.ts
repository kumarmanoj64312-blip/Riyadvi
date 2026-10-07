import { ok } from "@/server/utils/http";
import { formRoute } from "@/server/utils/forms";
import { contactSchema } from "@/server/validators/leads";
import { createContactEnquiry } from "@/server/services/lead.service";

/** POST /api/contact — contact / quote form → ContactEnquiry (+ team email). */
export const POST = formRoute(contactSchema, async (data, meta) => {
  const enquiry = await createContactEnquiry(data, meta);
  return ok(
    { id: enquiry.id },
    { status: 201, message: "Thank you! Your message has been received — we'll get back to you within one business day." },
  );
});
