import { ApiError } from "../utils/http.js";

/**
 * Validates and sanitises req.body against a Zod schema.
 *
 * On success req.body is REPLACED with the parsed output, so controllers only
 * ever see trimmed, typed, whitelisted fields (unknown keys are stripped —
 * a client can't sneak `status: "closed"` into a new enquiry).
 * On failure → 400 with per-field messages the form can show inline.
 */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join(".") || "body", message: i.message }));
    throw ApiError.badRequest("Please check the highlighted fields.", errors);
  }
  req.body = result.data;
  next();
};
