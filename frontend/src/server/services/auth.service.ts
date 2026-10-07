import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env, isProd } from "../config/env";
import { ApiError } from "../utils/errors";
import { Admin } from "../models/Admin";

export const SESSION_COOKIE = "riyadvi_admin";
const SESSION_SECONDS = 8 * 60 * 60;

/**
 * Cookie settings: unreadable by JS, HTTPS-only in production, not sent on
 * cross-site sub-requests. Path "/" so the admin pages (Server Components)
 * receive it as well as the /api/admin routes. Same origin as the site now,
 * so it is always a first-party cookie.
 */
export const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_SECONDS, // seconds (Next's cookie API), not ms like Express
});

/** Constant-time string comparison (avoids leaking how many characters matched). */
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** SHA-256 so both sides have equal length (timingSafeEqual needs that). */
const digest = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

/** Compared against when the email is unknown, so timing doesn't reveal whether it exists. */
let dummyHash: string | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("riyadvi-timing-equaliser", 12));

/** .env credentials — used only until an admin has been seeded into MongoDB. */
function envCredentialsMatch(email: string, password: string) {
  const e = env();
  const emailOk = safeEqual(email, e.ADMIN_EMAIL);
  const passwordOk = e.ADMIN_PASSWORD_HASH
    ? bcrypt.compareSync(password, e.ADMIN_PASSWORD_HASH)
    : safeEqual(digest(password), digest(e.ADMIN_PASSWORD ?? ""));
  return emailOk && passwordOk;
}

/**
 * Verifies admin credentials and returns a signed session token.
 *  1. Admin account in MongoDB (created by `npm run seed` / `seed:admin`) → bcrypt.
 *  2. No admin seeded yet → fall back to ADMIN_EMAIL / ADMIN_PASSWORD from .env.
 * Wrong email and wrong password give the same error and similar timing
 * (a bcrypt compare runs either way), so attackers can't probe which was wrong.
 */
export async function login(rawEmail: string, rawPassword: string): Promise<string> {
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
    await bcrypt.compare(password, getDummyHash()); // equalise timing for unknown emails
    throw fail();
  }

  return jwt.sign({ sub: email, role: "admin" }, env().JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env().JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export type AdminSession = JwtPayload & { sub: string; role: "admin" };

/** Returns the session payload, or throws 401. Algorithm pinned to HS256. */
export function verifySession(token: string): AdminSession {
  try {
    return jwt.verify(token, env().JWT_SECRET, { algorithms: ["HS256"] }) as AdminSession;
  } catch {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }
}
