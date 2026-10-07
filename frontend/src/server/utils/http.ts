import mongoose from "mongoose";
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { connectDB } from "../config/db";
import { isProd } from "../config/env";
import { logger } from "./logger";
import { ApiError, type FieldError } from "./errors";
import { apiLimiter, clientIp, rateLimit } from "./rateLimit";

export { ApiError, clientIp };

/**
 * The ONE response shape every endpoint returns:
 *
 *   { success: boolean, message: string, data?: any, errors?: [{ field, message }] }
 *
 * The browser client (lib/apiClient.ts) parses exactly this, so success,
 * validation errors and server errors are all handled the same way.
 */
export function ok(data?: unknown, { status = 200, message = "OK" }: { status?: number; message?: string } = {}) {
  const body: Record<string, unknown> = { success: true, message };
  if (data !== undefined) body.data = data;
  return NextResponse.json(body, { status });
}

/**
 * Central error mapper — the only place errors become HTTP responses
 * (the equivalent of Express's error-handling middleware). Known error types
 * get proper status codes; anything unexpected is a generic 500 with no stack
 * trace in production.
 */
export function errorResponse(err: unknown, req: NextRequest) {
  let status = 500;
  let message = "Something went wrong. Please try again later.";
  let errors: FieldError[] | undefined;

  if (err instanceof ApiError) {
    ({ status, message, errors } = err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = "Validation failed.";
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}.`;
  } else if ((err as { code?: number })?.code === 11000) {
    status = 409;
    message = "A record with these details already exists.";
  }

  if (status >= 500) logger.error(`${req.method} ${req.nextUrl.pathname} failed`, isProd ? (err as Error)?.message : err);

  const body: Record<string, unknown> = { success: false, message };
  if (errors?.length) body.errors = errors;
  if (!isProd && status >= 500) body.stack = (err as Error)?.stack; // dev-only debugging aid
  return NextResponse.json(body, { status, headers: err instanceof ApiError ? err.headers : undefined });
}

type Handler<P> = (req: NextRequest, params: P) => Promise<Response>;

/**
 * Wraps a Route Handler with the cross-cutting concerns Express used to
 * provide as middleware:
 *   1. API-wide rate limit
 *   2. open (or reuse) the MongoDB connection
 *   3. try/catch → errorResponse
 * `db: false` skips step 2 (e.g. the health check reports DB state itself).
 */
export function route<P = Record<string, never>>(fn: Handler<P>, { db = true }: { db?: boolean } = {}) {
  return async (req: NextRequest, ctx: { params: Promise<P> }) => {
    try {
      rateLimit(apiLimiter, req);
      if (db) await connectDB();
      return await fn(req, await ctx.params);
    } catch (err) {
      return errorResponse(err, req);
    }
  };
}

export const requestMeta = (req: NextRequest) => ({ userAgent: String(req.headers.get("user-agent") ?? "").slice(0, 300) });

const JSON_LIMIT = 100 * 1024; // forms are small; reject huge bodies

/** Reads a JSON body with a size cap. Malformed or oversized → 400 / 413. */
export async function readJson(req: NextRequest): Promise<unknown> {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    throw new ApiError(415, "JSON body required.");
  }
  const text = await req.text();
  if (text.length > JSON_LIMIT) throw new ApiError(413, "Request body is too large.");
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw ApiError.badRequest("Malformed JSON body.");
  }
}

/**
 * Validates and sanitises input against a Zod schema. Returns the PARSED
 * output, so handlers only ever see trimmed, typed, whitelisted fields
 * (unknown keys are stripped — a client can't sneak `status: "closed"` into a
 * new enquiry). Failure → 400 with per-field messages the form shows inline.
 */
export function validate<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join(".") || "body", message: i.message }));
    throw ApiError.badRequest("Please check the highlighted fields.", errors);
  }
  return result.data;
}

/**
 * Honeypot: every form has a hidden "website" field humans never see or fill.
 * Bots fill every input. If it has a value we pretend success (so the bot
 * learns nothing) but store nothing.
 */
export function honeypotTriggered(body: unknown, req: NextRequest): boolean {
  const website = (body as { website?: unknown } | null)?.website;
  if (typeof website === "string" && website.trim() !== "") {
    logger.warn("Honeypot triggered — submission discarded", { path: req.nextUrl.pathname, ip: clientIp(req) });
    return true;
  }
  return false;
}

export const honeypotResponse = () => ok(undefined, { status: 201, message: "Thank you! We'll be in touch shortly." });
