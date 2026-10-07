import { Schema } from "mongoose";
import { baseOptions, defineModel } from "./_shared";

/* ─── Job (mirrors the Job type in src/types/content.ts) ───────────────── */
const jobSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    title: { type: String, required: true },
    department: { type: String, required: true, index: true },
    experience: { min: Number, max: Number },
    location: String,
    type: String,
    summary: String,
    responsibilities: [String],
    requirements: [String],
    niceToHave: [String],
    postedAt: String,
    open: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  baseOptions,
);
export const Job = defineModel("Job", jobSchema);

/* ─── Career application ───────────────────────────────────────────────── */
export const APPLICATION_STATUSES = ["new", "reviewing", "shortlisted", "rejected", "hired"];

const careerApplicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    position: { type: String, required: true }, // job title at the time of applying
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    message: { type: String, trim: true, maxlength: 2000, default: "" },
    // Pointer to the GridFS file — the resume itself is not in this document.
    resume: {
      fileId: { type: Schema.Types.ObjectId, required: true },
      filename: String,
      contentType: String,
      size: Number,
    },
    status: { type: String, enum: APPLICATION_STATUSES, default: "new", index: true },
    userAgent: { type: String, default: "" },
  },
  baseOptions,
);
careerApplicationSchema.index({ createdAt: -1 });
export const CareerApplication = defineModel("CareerApplication", careerApplicationSchema);
