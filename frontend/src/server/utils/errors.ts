export type FieldError = { field: string; message: string };

/** Operational error with an HTTP status — thrown from services and handlers. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: FieldError[],
    /** Extra response headers (e.g. Retry-After on 429). */
    public headers?: Record<string, string>,
  ) {
    super(message);
  }
  static badRequest(message = "Bad request", errors?: FieldError[]) {
    return new ApiError(400, message, errors);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }
}
