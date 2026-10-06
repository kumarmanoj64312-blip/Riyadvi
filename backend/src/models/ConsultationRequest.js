import mongoose from "mongoose";
import { baseOptions, LEAD_STATUSES } from "./_shared.js";

/** A "Book a Free Consultation" request with a preferred date and slot. */
const consultationRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    requirement: { type: String, required: true, trim: true, maxlength: 60 },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    sourcePage: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  baseOptions,
);

consultationRequestSchema.index({ createdAt: -1 });

export const ConsultationRequest = mongoose.model("ConsultationRequest", consultationRequestSchema);
