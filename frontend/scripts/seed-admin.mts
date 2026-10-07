/**
 * Seeds only the admin account (content untouched).
 *   npm run seed:admin
 */
import "./_env.mjs";
import mongoose from "mongoose";
import { connectDB } from "@/server/config/db";
import { seedAdmin } from "@/server/seed/seedAdmin";
import { logger } from "@/server/utils/logger";

try {
  await connectDB();
  await seedAdmin();
} catch (err) {
  logger.error("Admin seed failed", (err as Error).message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
