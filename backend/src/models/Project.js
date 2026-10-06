import mongoose from "mongoose";
import { baseOptions } from "./_shared.js";

/* Mirrors the frontend `Project` type (frontend/src/types/content.ts). */
const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    client: { type: String, required: true },
    title: { type: String, required: true },
    industry: { type: String, required: true, index: true },
    year: Number,
    services: { type: [String], index: true },
    summary: String,
    challenge: String,
    solution: String,
    deliverables: [String],
    technologies: [String],
    results: [new mongoose.Schema({ value: String, label: String }, { _id: false })],
    testimonial: { type: new mongoose.Schema({ quote: String, author: String, role: String }, { _id: false }), default: undefined },
    accent: { type: String, default: "#d4af37" },
    screens: [new mongoose.Schema({ label: String, kind: { type: String, enum: ["desktop", "mobile"] } }, { _id: false })],
    showcase: { type: new mongoose.Schema({ device: { type: String, enum: ["phone", "laptop"] } }, { _id: false }), default: undefined },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  baseOptions,
);

export const Project = mongoose.model("Project", projectSchema);
