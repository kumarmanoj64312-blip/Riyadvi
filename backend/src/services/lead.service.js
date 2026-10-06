import { ContactEnquiry } from "../models/ContactEnquiry.js";
import { ConsultationRequest } from "../models/ConsultationRequest.js";
import { LeadMagnetLead } from "../models/LeadMagnetLead.js";
import { env } from "../config/env.js";
import { notifyTeamInBackground } from "./notification.service.js";

/*
 * Lead business logic. Controllers stay thin (HTTP in/out); everything about
 * what happens to a lead lives here, so admin tools or other channels (e.g. a
 * WhatsApp bot later) can reuse it.
 */

/** Saves a contact enquiry, then notifies the team in the background. */
export async function createContactEnquiry(data, meta) {
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
export async function createConsultationRequest(data, meta) {
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
export async function createLeadMagnetLead(data, meta) {
  const lead = await LeadMagnetLead.create({ ...data, userAgent: meta.userAgent });
  notifyTeamInBackground(
    `Guide downloaded: ${data.name} (${data.company})`,
    { Name: data.name, Company: data.company, Email: data.email, Phone: data.phone },
    data.email,
  );
  return { id: lead.id, downloadUrl: env.GUIDE_DOWNLOAD_URL };
}
