import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env, isProd } from "../config/env.js";
import { ApiError } from "../utils/http.js";

export const SESSION_COOKIE = "riyadvi_admin";

/**
 * Cookie settings: unreadable by JS, HTTPS-only in production, not sent on
 * cross-site sub-requests. Path must be "/" — the Next.js server renders
 * /admin/* pages and has to receive the cookie on those page requests too
 * (a "/api" path made the browser withhold it → redirect loop to login).
 */
export const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 8 * 60 * 60 * 1000,
});

/** Constant-time string comparison (avoids leaking how many characters matched). */
function safeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** SHA-256 so both sides have equal length (timingSafeEqual needs that). */
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");

/**
 * Verifies the single admin's credentials and returns a signed session token.
 * Wrong email and wrong password produce the same error and similar timing
 * (the password check runs either way), so attackers can't probe which one was wrong.
 * Password: plain ADMIN_PASSWORD (constant-time compare) or bcrypt ADMIN_PASSWORD_HASH.
 */
export async function login(email, password) {
  const emailOk = safeEqual(String(email).trim().toLowerCase(), env.ADMIN_EMAIL);
  const passwordOk = env.ADMIN_PASSWORD_HASH
    ? await bcrypt.compare(String(password), env.ADMIN_PASSWORD_HASH)
    : safeEqual(digest(String(password)), digest(env.ADMIN_PASSWORD));
  if (!emailOk || !passwordOk) throw new ApiError(401, "Invalid email or password.");

  return jwt.sign({ sub: env.ADMIN_EMAIL, role: "admin" }, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/** Returns the session payload, or throws 401. Algorithm pinned to HS256. */
export function verifySession(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }
}
