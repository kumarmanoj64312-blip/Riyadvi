/**
 * Seeds content collections from JSON exported by the frontend
 * (`npm run export:content` in /frontend).
 *
 *   npm run seed
 *
 * Idempotent: upserts by slug, so it can run on every deploy without
 * duplicating documents. Lead collections are never touched.
 */
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Service } from "../models/Service.js";
import { Project } from "../models/Project.js";
import { Post } from "../models/Post.js";
import { Job } from "../models/Career.js";
import { logger } from "../utils/logger.js";

const load = async (name) => JSON.parse(await readFile(new URL(`./data/${name}.json`, import.meta.url), "utf8"));

async function upsertAll(Model, docs) {
  const ops = docs.map((doc) => ({
    updateOne: { filter: { slug: doc.slug }, update: { $set: doc }, upsert: true },
  }));
  const res = await Model.bulkWrite(ops);
  logger.info(`${Model.modelName}: ${res.upsertedCount} inserted, ${res.modifiedCount} updated`);
}

try {
  await connectDB();
  await upsertAll(Service, await load("services"));
  await upsertAll(Project, await load("projects"));
  await upsertAll(Post, await load("posts"));
  await upsertAll(Job, await load("jobs"));
  logger.info("Seed complete ✓");
} catch (err) {
  logger.error("Seed failed", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
