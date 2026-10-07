import { Schema } from "mongoose";
import { baseOptions, defineModel, LEAD_STATUSES } from "./_shared";

/** A message from the /contact form (and "Get a Quote" CTAs). */
const contactEnquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    company: { type: String, trim: true, maxlength: 120, default: "" },
    requirement: { type: String, required: true, trim: true, maxlength: 60 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    sourcePage: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  baseOptions,
);

// Admin lists newest first, often filtered by status.
contactEnquirySchema.index({ createdAt: -1 });

export const ContactEnquiry = defineModel("ContactEnquiry", contactEnquirySchema);
