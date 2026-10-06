import { ContactEnquiry } from "../models/ContactEnquiry.js";
import { ConsultationRequest } from "../models/ConsultationRequest.js";
import { HealthCheckupLead } from "../models/HealthCheckupLead.js";
import { LeadMagnetLead } from "../models/LeadMagnetLead.js";
import { APPLICATION_STATUSES, CareerApplication } from "../models/Career.js";
import { LEAD_STATUSES } from "../models/_shared.js";
import { ApiError } from "../utils/http.js";
import { openResume } from "./resumeStorage.service.js";

/**
 * Admin read/update logic. Each lead type is described once in COLLECTIONS
 * (model, allowed statuses, searchable fields), and the same generic list /
 * status-update code serves all of them.
 */
export const COLLECTIONS = {
  enquiries: { Model: ContactEnquiry, statuses: LEAD_STATUSES, search: ["name", "email", "company", "requirement"] },
  consultations: { Model: ConsultationRequest, statuses: LEAD_STATUSES, search: ["name", "email", "requirement"] },
  "health-checkups": { Model: HealthCheckupLead, statuses: LEAD_STATUSES, search: ["name", "email", "company"] },
  "lead-magnet": { Model: LeadMagnetLead, statuses: LEAD_STATUSES, search: ["name", "email", "company"] },
  applications: { Model: CareerApplication, statuses: APPLICATION_STATUSES, search: ["name", "email", "position"] },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function getCollection(key) {
  const c = COLLECTIONS[key];
  if (!c) throw ApiError.notFound("Unknown collection");
  return c;
}

/** Paginated, filterable, searchable list (newest first). */
export async function listLeads(key, { status, q, page = 1, limit = 20 }) {
  const { Model, statuses, search } = getCollection(key);
  const filter = {};
  if (status && statuses.includes(status)) filter.status = status;
  if (q) {
    // User input is regex-escaped → no ReDoS / operator injection.
    const rx = new RegExp(escapeRegex(String(q).slice(0, 80)), "i");
    filter.$or = search.map((field) => ({ [field]: rx }));
  }
  const size = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const current = Math.max(Number(page) || 1, 1);

  const [items, total] = await Promise.all([
    Model.find(filter).sort({ createdAt: -1 }).skip((current - 1) * size).limit(size).select("-userAgent"),
    Model.countDocuments(filter),
  ]);
  return { items, total, page: current, pages: Math.max(1, Math.ceil(total / size)), statuses };
}

export async function updateStatus(key, id, status) {
  const { Model, statuses } = getCollection(key);
  if (!statuses.includes(status)) throw ApiError.badRequest(`Status must be one of: ${statuses.join(", ")}`);
  const doc = await Model.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!doc) throw ApiError.notFound("Record not found");
  return doc;
}

/** Dashboard numbers: totals, "new" (unhandled) counts and last-7-day counts. */
export async function getStats() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const entries = await Promise.all(
    Object.entries(COLLECTIONS).map(async ([key, { Model }]) => {
      const [total, unhandled, thisWeek] = await Promise.all([
        Model.countDocuments(),
        Model.countDocuments({ status: "new" }),
        Model.countDocuments({ createdAt: { $gte: weekAgo } }),
      ]);
      return [key, { total, new: unhandled, thisWeek }];
    }),
  );
  return Object.fromEntries(entries);
}

/** Resume stream + metadata for an application (authenticated route only). */
export async function getResume(applicationId) {
  const app = await CareerApplication.findById(applicationId);
  if (!app) throw ApiError.notFound("Application not found");
  return { stream: openResume(app.resume.fileId), resume: app.resume, name: app.name };
}
