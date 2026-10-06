import mongoose from "mongoose";
import { ApiError } from "../utils/http.js";
import { isProd } from "../config/env.js";
import { logger } from "../utils/logger.js";

/** Unknown /api route → 404 in the standard shape. */
export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Central error handler — the only place errors become HTTP responses.
 * Express 5 forwards errors thrown in async handlers here automatically.
 * Maps known error types to proper status codes; anything unexpected is a
 * 500 with a generic message (no stack traces or internals in production).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = 500;
  let message = "Something went wrong. Please try again later.";
  let errors;

  if (err instanceof ApiError) {
    ({ status, message, errors } = err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = "Validation failed.";
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}.`;
  } else if (err?.code === 11000) {
    status = 409;
    message = "A record with these details already exists.";
  } else if (err?.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON body.";
  } else if (err?.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large.";
  } else if (err?.message === "CORS_NOT_ALLOWED") {
    status = 403;
    message = "Origin not allowed.";
  }

  if (status >= 500) logger.error(`${req.method} ${req.originalUrl} failed`, isProd ? err.message : err);

  const body = { success: false, message };
  if (errors?.length) body.errors = errors;
  if (!isProd && status >= 500) body.stack = err?.stack; // dev-only debugging aid
  res.status(status).json(body);
}
