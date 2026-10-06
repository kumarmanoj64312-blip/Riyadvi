import mongoose from "mongoose";
import { baseOptions, LEAD_STATUSES } from "./_shared.js";

/**
 * A completed Business Health Checkup: contact details, every answer keyed by
 * question id (validated against the questionnaire config before saving), and
 * the computed score + recommended services.
 */
const healthCheckupLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    company: { type: String, trim: true, maxlength: 120, default: "" },
    // Flexible by design: the questionnaire evolves as data, not schema.
    answers: { type: mongoose.Schema.Types.Mixed, required: true },
    score: {
      total: { type: Number, min: 0, max: 100 },
      areas: { type: Map, of: Number },
    },
    recommendations: [String],
    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    sourcePage: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  baseOptions,
);

healthCheckupLeadSchema.index({ createdAt: -1 });

export const HealthCheckupLead = mongoose.model("HealthCheckupLead", healthCheckupLeadSchema);
