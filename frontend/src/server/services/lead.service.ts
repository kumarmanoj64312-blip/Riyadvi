import { ContactEnquiry } from "../models/ContactEnquiry";
import { ConsultationRequest } from "../models/ConsultationRequest";
import { LeadMagnetLead } from "../models/LeadMagnetLead";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber";
import { env } from "../config/env";
import { notifyTeamInBackground } from "./notification.service";
import type { ConsultationInput, ContactInput, LeadMagnetInput, NewsletterInput } from "../validators/leads";

/*
 * Lead business logic. Route Handlers stay thin (HTTP in/out); everything
 * about what happens to a lead lives here, so admin tools or other channels
 * (e.g. a WhatsApp bot later) can reuse it.
 */
export type RequestMeta = { userAgent: string };

/** Saves a contact enquiry, then notifies the team in the background. */
export async function createContactEnquiry(data: ContactInput, meta: RequestMeta) {
  const enquiry = await ContactEnquiry.create({ ...data, userAgent: meta.userAgent });
  notifyTeamInBackground(
    `New enquiry: ${data.name} — ${data.requirement}`,
    {
      Name: data.name,
      Email: data.email,
      Phone: data.phone,
      Company: data.company || "—",
      Requirement: data.requirement,
      Message: data.message,
      Page: data.sourcePage || "—",
    },
    data.email,
  );
  return enquiry;
}

/** Saves a consultation request, then notifies the team in the background. */
export async function createConsultationRequest(data: ConsultationInput, meta: RequestMeta) {
  const request = await ConsultationRequest.create({ ...data, userAgent: meta.userAgent });
  notifyTeamInBackground(
    `New consultation request: ${data.name}`,
    {
      Name: data.name,
      Email: data.email,
      Phone: data.phone,
      "Preferred date": data.preferredDate.toDateString(),
      "Preferred time": data.preferredTime,
      Requirement: data.requirement,
      Notes: data.notes || "—",
    },
    data.email,
  );
  return request;
}

/** Stores a lead-magnet download and returns where to download the guide. */
export async function createLeadMagnetLead(data: LeadMagnetInput, meta: RequestMeta) {
  const lead = await LeadMagnetLead.create({ ...data, userAgent: meta.userAgent });
  notifyTeamInBackground(
    `Guide downloaded: ${data.name} (${data.company})`,
    { Name: data.name, Company: data.company, Email: data.email, Phone: data.phone },
    data.email,
  );
  return { id: lead.id as string, downloadUrl: env().GUIDE_DOWNLOAD_URL };
}

/**
 * Adds an email to the newsletter list. Idempotent: an existing subscriber is
 * left as-is (an "unsubscribed" one opting in again goes back to "new").
 * No team email per signup: subscribers are reviewed in the admin instead.
 */
export async function subscribeToNewsletter(data: NewsletterInput, meta: RequestMeta) {
  const existing = await NewsletterSubscriber.findOne({ email: data.email });
  if (existing) {
    if (existing.status === "unsubscribed") {
      existing.status = "new";
      await existing.save();
    }
    return { created: false };
  }
  try {
    await NewsletterSubscriber.create({ ...data, userAgent: meta.userAgent });
    return { created: true };
  } catch (err) {
    // Two submissions racing past findOne: the unique index rejects the second one.
    if ((err as { code?: number }).code === 11000) return { created: false };
    throw err;
  }
}
