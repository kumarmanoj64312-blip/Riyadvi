/**
 * The ONE response shape every endpoint returns:
 *
 *   { success: boolean, message: string, data?: any, errors?: [{ field, message }] }
 *
 * The frontend parses exactly this, so success, validation errors and server
 * errors are all handled the same way.
 */

/** Operational error with an HTTP status — thrown from services/controllers. */
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message = "Bad request", errors) {
    return new ApiError(400, message, errors);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }
}

export function sendSuccess(res, { status = 200, message = "OK", data } = {}) {
  const body = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(status).json(body);
}
