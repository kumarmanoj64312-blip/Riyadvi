import type { Model } from "mongoose";
import { ContactEnquiry } from "../models/ContactEnquiry";
import { ConsultationRequest } from "../models/ConsultationRequest";
import { HealthCheckupLead } from "../models/HealthCheckupLead";
import { LeadMagnetLead } from "../models/LeadMagnetLead";
import { APPLICATION_STATUSES, CareerApplication } from "../models/Career";
import { LEAD_STATUSES } from "../models/_shared";
import { ApiError } from "../utils/errors";
import { openResume } from "./resumeStorage.service";

/**
 * Admin read/update logic. Each lead type is described once in COLLECTIONS
 * (model, allowed statuses, searchable fields), and the same generic list /
 * status-update code serves all of them.
 */
type CollectionDef = { Model: Model<any>; statuses: string[]; search: string[] }; // eslint-disable-line @typescript-eslint/no-explicit-any

export const COLLECTIONS: Record<string, CollectionDef> = {
  enquiries: { Model: ContactEnquiry, statuses: LEAD_STATUSES, search: ["name", "email", "company", "requirement"] },
  consultations: { Model: ConsultationRequest, statuses: LEAD_STATUSES, search: ["name", "email", "requirement"] },
  "health-checkups": { Model: HealthCheckupLead, statuses: LEAD_STATUSES, search: ["name", "email", "company"] },
  "lead-magnet": { Model: LeadMagnetLead, statuses: LEAD_STATUSES, search: ["name", "email", "company"] },
  applications: { Model: CareerApplication, statuses: APPLICATION_STATUSES, search: ["name", "email", "position"] },
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function getCollection(key: string): CollectionDef {
  const c = Object.hasOwn(COLLECTIONS, key) ? COLLECTIONS[key] : undefined;
  if (!c) throw ApiError.notFound("Unknown collection");
  return c;
}

export type ListQuery = { status?: string | null; q?: string | null; page?: string | number | null; limit?: string | number | null };

/** Paginated, filterable, searchable list (newest first). */
export async function listLeads(key: string, { status, q, page, limit }: ListQuery) {
  const { Model, statuses, search } = getCollection(key);
  const filter: Record<string, unknown> = {};
  if (status && statuses.includes(status)) filter.status = status;
  if (q) {
    // User input is regex-escaped → no ReDoS / operator injection.
    const rx = new RegExp(escapeRegex(String(q).slice(0, 80)), "i");
    filter.$or = search.map((field) => ({ [field]: rx }));
  }
  const size = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const current = Math.max(Number(page) || 1, 1);

  const [items, total] = await Promise.all([
    Model.find(filter)
      .sort({ createdAt: -1 })
      .skip((current - 1) * size)
      .limit(size)
      .select("-userAgent"),
    Model.countDocuments(filter),
  ]);
  return { items, total, page: current, pages: Math.max(1, Math.ceil(total / size)), statuses };
}

export async function updateStatus(key: string, id: string, status: string) {
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
      return [key, { total, new: unhandled, thisWeek }] as const;
    }),
  );
  return Object.fromEntries(entries);
}

/** Resume stream + metadata for an application (authenticated route only). */
export async function getResume(applicationId: string) {
  const app = await CareerApplication.findById(applicationId);
  if (!app?.resume?.fileId) throw ApiError.notFound("Application not found");
  return {
    stream: openResume(app.resume.fileId),
    resume: { filename: app.resume.filename ?? "resume", contentType: app.resume.contentType ?? "application/octet-stream" },
    name: app.name,
  };
}
