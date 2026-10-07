import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { Admin } from "../models/Admin";
import { logger } from "../utils/logger";

/**
 * Creates (or updates) the admin account from .env:
 *   ADMIN_EMAIL + ADMIN_PASSWORD   (or a ready-made ADMIN_PASSWORD_HASH)
 * Only the bcrypt hash is written to MongoDB. Idempotent — re-running it
 * re-applies the password from .env, so .env is how you reset it.
 * Expects an open DB connection.
 */
export async function seedAdmin() {
  const e = env();
  const passwordHash = e.ADMIN_PASSWORD_HASH ?? (await bcrypt.hash(e.ADMIN_PASSWORD!, 12));
  const res = await Admin.updateOne(
    { email: e.ADMIN_EMAIL },
    { $set: { passwordHash, role: "admin" }, $setOnInsert: { name: "Administrator" } },
    { upsert: true },
  );
  logger.info(`Admin ${e.ADMIN_EMAIL}: ${res.upsertedCount ? "created" : "updated"}`);
}
