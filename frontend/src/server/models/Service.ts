import { Schema } from "mongoose";
import { baseOptions, defineModel } from "./_shared";

/*
 * Mirrors the Service type (src/types/content.ts), so the website renders
 * DB content exactly like its bundled fallback data.
 * Adding a document here = a new /services/[slug] page, no redeploy.
 */
const titled = new Schema({ title: String, description: String }, { _id: false });

const serviceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    summary: { type: String, required: true },
    sceneType: {
      type: String,
      enum: ["web-development", "app-development", "digital-marketing", "ar-vr", "3d-modeling", "ui-ux-design", "generic"],
      default: "generic",
    },
    hero: { headline: String, intro: String },
    problem: { title: String, points: [String] },
    solution: { title: String, description: String },
    features: [titled],
    useCases: [new Schema({ industry: String, description: String }, { _id: false })],
    techStack: [String],
    process: [titled],
    relatedProjects: [String],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  baseOptions,
);

export const Service = defineModel("Service", serviceSchema);
