import mongoose from "mongoose";
import { baseOptions, LEAD_STATUSES } from "./_shared.js";

/** Someone who downloaded a lead magnet (e.g. the Software Project Planning Guide). */
const leadMagnetLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    resource: { type: String, required: true, default: "software-project-planning-guide" },
    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    sourcePage: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  baseOptions,
);

leadMagnetLeadSchema.index({ createdAt: -1 });

export const LeadMagnetLead = mongoose.model("LeadMagnetLead", leadMagnetLeadSchema);
