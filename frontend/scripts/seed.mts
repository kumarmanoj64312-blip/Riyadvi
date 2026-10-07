/**
 * Seeds the content collections straight from the typed data in src/data/*
 * (the same objects the site renders with CONTENT_SOURCE=local) plus the
 * admin account from .env.
 *
 *   npm run seed          (content + admin)
 *   npm run seed:admin    (admin only)
 *
 * Idempotent: upserts by slug, so it can run on every deploy without
 * duplicating documents. Lead collections are never touched.
 */
import "./_env.mjs";
import mongoose, { type Model } from "mongoose";
import { connectDB } from "@/server/config/db";
import { Service } from "@/server/models/Service";
import { Project } from "@/server/models/Project";
import { Post } from "@/server/models/Post";
import { Job } from "@/server/models/Career";
import { seedAdmin } from "@/server/seed/seedAdmin";
import { logger } from "@/server/utils/logger";
import { services } from "@/data/services";
import { projects } from "@/data/projects";
import { posts } from "@/data/posts";
import { jobs } from "@/data/jobs";

/** `order` keeps the DB listing in the same order as the data file. */
const ordered = <T extends object>(docs: T[]) => docs.map((doc, order) => ({ ...doc, order }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertAll(Model: Model<any>, docs: { slug: string }[]) {
  const ops = docs.map((doc) => ({
    updateOne: { filter: { slug: doc.slug }, update: { $set: doc }, upsert: true },
  }));
  const res = await Model.bulkWrite(ops);
  logger.info(`${Model.modelName}: ${res.upsertedCount} inserted, ${res.modifiedCount} updated`);
}

try {
  await connectDB();
  await upsertAll(Service, ordered(services));
  await upsertAll(Project, ordered(projects));
  await upsertAll(Post, ordered(posts));
  await upsertAll(Job, ordered(jobs));
  await seedAdmin();
  logger.info("Seed complete ✓");
} catch (err) {
  logger.error("Seed failed", (err as Error).message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
