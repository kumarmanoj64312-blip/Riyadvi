import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger.js";

/** Same JSON shape as every other error, so the frontend needs no special case. */
const tooMany = (_req, res) =>
  res.status(429).json({ success: false, message: "Too many requests — please try again in a few minutes." });

/** Whole API: generous ceiling against scraping / accidental loops. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: tooMany,
});

/** Form submissions: a real person never needs more than a few per 10 minutes. */
export const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: tooMany,
});

/**
 * Honeypot: every form has a hidden "website" field humans never see or fill.
 * Bots fill every input. If it has a value we pretend success (so the bot
 * learns nothing) but store nothing.
 */
export function honeypot(req, res, next) {
  if (typeof req.body?.website === "string" && req.body.website.trim() !== "") {
    logger.warn("Honeypot triggered — submission discarded", { path: req.path, ip: req.ip });
    return res.status(201).json({ success: true, message: "Thank you! We'll be in touch shortly." });
  }
  next();
}
