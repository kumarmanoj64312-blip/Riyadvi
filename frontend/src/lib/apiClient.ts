/**
 * Browser → API client for form submissions.
 *
 * Calls same-origin `/api/*` (Route Handlers in src/app/api) and
 * normalises our standard response shape into a simple result:
 *   { ok: true,  message, data }
 *   { ok: false, message, fieldErrors: { email: "…" } }
 * Forms never deal with fetch/JSON/HTTP details directly.
 */
export type ApiResult<T = unknown> =
  | { ok: true; message: string; data?: T }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

type ApiBody<T> = { success: boolean; message: string; data?: T; errors?: { field: string; message: string }[] };

// Generous: a cold serverless start + first DB connection can take a few seconds.
const TIMEOUT_MS = 30_000;

export async function postJson<T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = (await res.json().catch(() => null)) as ApiBody<T> | null;

    if (res.ok && json?.success) return { ok: true, message: json.message, data: json.data };

    const fieldErrors = Object.fromEntries((json?.errors ?? []).map((e) => [e.field, e.message]));
    return {
      ok: false,
      message: json?.message ?? "Something went wrong on our side. Please try again or reach us on WhatsApp.",
      fieldErrors,
    };
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === "TimeoutError";
    return {
      ok: false,
      message: timedOut
        ? "Our server is taking longer than usual to respond. Please try again in a moment."
        : "We couldn't reach the server — please check your connection and try again.",
      fieldErrors: {},
    };
  }
}

/** Fire-and-forget ping that warms the API function and opens the DB connection early. */
export function warmUpApi() {
  fetch("/api/health", { cache: "no-store" }).catch(() => {});
}

/**
 * multipart/form-data POST (file uploads). Same result shape as postJson.
 * No Content-Type header on purpose: the browser sets it with the boundary.
 */
export async function postForm<T = unknown>(path: string, form: FormData): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api${path}`, { method: "POST", body: form, signal: AbortSignal.timeout(TIMEOUT_MS) });
    const json = (await res.json().catch(() => null)) as ApiBody<T> | null;
    if (res.ok && json?.success) return { ok: true, message: json.message, data: json.data };
    const fieldErrors = Object.fromEntries((json?.errors ?? []).map((e) => [e.field, e.message]));
    return { ok: false, message: json?.message ?? "Upload failed. Please try again.", fieldErrors };
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === "TimeoutError";
    return {
      ok: false,
      message: timedOut ? "The upload is taking too long — please try again." : "We couldn't reach the server — please check your connection.",
      fieldErrors: {},
    };
  }
}
