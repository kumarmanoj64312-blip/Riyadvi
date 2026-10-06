import mongoose from "mongoose";
import { baseOptions } from "./_shared.js";

/* Mirrors the frontend `Post` type; `body` holds structured blocks (CMS-style). */
const postSchema = new mongoose.Schema(
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
    body: { type: [mongoose.Schema.Types.Mixed], default: [] },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  baseOptions,
);

export const Post = mongoose.model("Post", postSchema);
