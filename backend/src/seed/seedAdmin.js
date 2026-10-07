import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { Admin } from "../models/Admin.js";
import { logger } from "../utils/logger.js";

/**
 * Creates (or updates) the admin account from .env:
 *   ADMIN_EMAIL + ADMIN_PASSWORD   (or a ready-made ADMIN_PASSWORD_HASH)
 * Only the bcrypt hash is written to MongoDB. Idempotent — re-running it
 * re-applies the password from .env, so .env is how you reset it.
 * Expects an open DB connection (used by seed.js and seed/admin.js).
 */
export async function seedAdmin() {
  const passwordHash = env.ADMIN_PASSWORD_HASH ?? (await bcrypt.hash(env.ADMIN_PASSWORD, 12));
  const res = await Admin.updateOne(
    { email: env.ADMIN_EMAIL },
    { $set: { passwordHash, role: "admin" }, $setOnInsert: { name: "Administrator" } },
    { upsert: true },
  );
  logger.info(`Admin ${env.ADMIN_EMAIL}: ${res.upsertedCount ? "created" : "updated"}`);
}
