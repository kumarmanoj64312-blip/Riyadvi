import { sendSuccess } from "../utils/http.js";
import { createConsultationRequest, createContactEnquiry, createLeadMagnetLead } from "../services/lead.service.js";
import { submitHealthCheckup } from "../services/healthCheckup.service.js";
import { submitApplication } from "../services/application.service.js";

/*
 * Thin controllers: req.body is already validated & sanitised by the
 * `validate` middleware; errors bubble to the central error handler
 * (Express 5 forwards async errors automatically).
 */

const meta = (req) => ({ userAgent: String(req.get("user-agent") ?? "").slice(0, 300) });

export async function submitContact(req, res) {
  const enquiry = await createContactEnquiry(req.body, meta(req));
  sendSuccess(res, {
    status: 201,
    message: "Thank you! Your message has been received — we'll get back to you within one business day.",
    data: { id: enquiry.id },
  });
}

export async function submitConsultation(req, res) {
  const request = await createConsultationRequest(req.body, meta(req));
  sendSuccess(res, {
    status: 201,
    message: "Your consultation request is in! We'll confirm your slot by email shortly.",
    data: { id: request.id },
  });
}

export async function submitCheckup(req, res) {
  const result = await submitHealthCheckup(req.body, meta(req));
  sendSuccess(res, {
    status: 201,
    message: "Your Business Health Checkup is complete — here are your results.",
    data: result,
  });
}

export async function submitLeadMagnet(req, res) {
  const result = await createLeadMagnetLead(req.body, meta(req));
  sendSuccess(res, { status: 201, message: "Your guide is ready to download.", data: result });
}

export async function submitJobApplication(req, res) {
  const application = await submitApplication(req.body, req.file, meta(req));
  sendSuccess(res, {
    status: 201,
    message: "Application received! Our team reviews every application and will reply within 5 working days.",
    data: { id: application.id },
  });
}
