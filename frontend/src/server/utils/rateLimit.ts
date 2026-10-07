import type { NextRequest } from "next/server";
import { ApiError } from "./errors";

/*
 * Fixed-window rate limiter (replaces express-rate-limit).
 *
 * Counters live in memory, on globalThis so `next dev` hot reloads don't reset
 * them. Limitation (documented in the README): on serverless hosting every
 * function instance has its own memory, so the limit is per instance — good
 * enough to stop a script hammering a form; for strict global limits, swap the
 * Map for Redis/Upstash without changing any call site.
 */
export type Limiter = { name: string; windowMs: number; limit: number; message: string };

export const apiLimiter: Limiter = {
  name: "api",
  windowMs: 15 * 60 * 1000,
  limit: 300, // generous ceiling against scraping / accidental loops
  message: "Too many requests — please try again in a few minutes.",
};

export const formLimiter: Limiter = {
  name: "form",
  windowMs: 10 * 60 * 1000,
  limit: 8, // a real person never needs more than a few submissions per 10 minutes
  message: "Too many requests — please try again in a few minutes.",
};

export const loginLimiter: Limiter = {
  name: "login",
  windowMs: 15 * 60 * 1000,
  limit: 10, // brute-force guard
  message: "Too many sign-in attempts. Try again in 15 minutes.",
};

type Bucket = { count: number; resetAt: number };
const g = globalThis as typeof globalThis & { __riyadviRate?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = (g.__riyadviRate ??= new Map());

/** Visitor IP (first entry of x-forwarded-for, set by Vercel / the dev server). */
export const clientIp = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

/** Counts one hit for this client; throws 429 (with Retry-After) once over the limit. */
export function rateLimit(limiter: Limiter, req: NextRequest) {
  const now = Date.now();
  const key = `${limiter.name}:${clientIp(req)}`;
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + limiter.windowMs };
    buckets.set(key, bucket);
  }
  bucket.count++;

  // Occasional sweep so the Map can't grow without bound.
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);

  if (bucket.count > limiter.limit) {
    throw new ApiError(429, limiter.message, undefined, { "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)) });
  }
}
