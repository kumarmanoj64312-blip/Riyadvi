import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env, isProd } from "../config/env.js";
import { ApiError } from "../utils/http.js";
import { Admin } from "../models/Admin.js";

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

/** Compared against when the email is unknown, so timing doesn't reveal whether it exists. */
const DUMMY_HASH = bcrypt.hashSync("riyadvi-timing-equaliser", 12);

/** .env credentials — used only until an admin has been seeded into MongoDB. */
function envCredentialsMatch(email, password) {
  const emailOk = safeEqual(email, env.ADMIN_EMAIL);
  const passwordOk = env.ADMIN_PASSWORD_HASH
    ? bcrypt.compareSync(password, env.ADMIN_PASSWORD_HASH)
    : safeEqual(digest(password), digest(env.ADMIN_PASSWORD));
  return emailOk && passwordOk;
}

/**
 * Verifies admin credentials and returns a signed session token.
 *  1. Admin account in MongoDB (created by `npm run seed` / `seed:admin`) → bcrypt.
 *  2. No admin seeded yet → fall back to ADMIN_EMAIL / ADMIN_PASSWORD from .env.
 * Wrong email and wrong password give the same error and similar timing
 * (a bcrypt compare runs either way), so attackers can't probe which was wrong.
 */
export async function login(rawEmail, rawPassword) {
  const email = String(rawEmail).trim().toLowerCase();
  const password = String(rawPassword);
  const fail = () => new ApiError(401, "Invalid email or password.");

  const admin = await Admin.findOne({ email }).select("+passwordHash");
  if (admin) {
    if (!(await bcrypt.compare(password, admin.passwordHash))) throw fail();
    await Admin.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });
  } else if ((await Admin.estimatedDocumentCount()) === 0) {
    if (!envCredentialsMatch(email, password)) throw fail();
  } else {
    await bcrypt.compare(password, DUMMY_HASH); // equalise timing for unknown emails
    throw fail();
  }

  return jwt.sign({ sub: email, role: "admin" }, env.JWT_SECRET, {
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
