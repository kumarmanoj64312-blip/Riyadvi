import rateLimit from "express-rate-limit";
import { SESSION_COOKIE, verifySession } from "../services/auth.service.js";
import { ApiError } from "../utils/http.js";

/** Protects every /api/admin route except login. */
export function requireAdmin(req, _res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) throw new ApiError(401, "Please sign in.");
  req.admin = verifySession(token);
  next();
}

/** Brute-force guard on login: 10 attempts per 15 minutes per IP. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ success: false, message: "Too many sign-in attempts. Try again in 15 minutes." }),
});
