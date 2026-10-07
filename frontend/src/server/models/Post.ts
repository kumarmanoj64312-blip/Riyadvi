import { Schema } from "mongoose";
import { baseOptions, defineModel } from "./_shared";

/* Mirrors the Post type; `body` holds structured blocks (CMS-style). */
const postSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    title: { type: String, required: true },
    excerpt: String,
    category: { type: String, index: true },
    tags: { type: [String], index: true },
    author: { name: String, role: String },
    publishedAt: { type: String, index: true },
    accent: String,
    featured: { type: Boolean, default: false },
    body: { type: [Schema.Types.Mixed], default: [] },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  baseOptions,
);

export const Post = defineModel("Post", postSchema);
