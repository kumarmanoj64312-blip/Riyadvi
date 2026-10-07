/**
 * Seeds only the admin account (content untouched).
 *   npm run seed:admin
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { seedAdmin } from "./seedAdmin.js";
import { logger } from "../utils/logger.js";

try {
  await connectDB();
  await seedAdmin();
} catch (err) {
  logger.error("Admin seed failed", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
