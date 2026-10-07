import type { NextRequest } from "next/server";
import { ApiError } from "./errors";
import { SESSION_COOKIE, verifySession } from "../services/auth.service";

/** Guards every /api/admin route except login/logout: valid session cookie or 401. */
export function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new ApiError(401, "Please sign in.");
  return verifySession(token);
}

/**
 * CSRF hardening for state changes: JSON only (a cross-site <form> can't send
 * JSON) and, when the browser sends an Origin, it must be this site.
 */
export function requireSameOriginJson(req: NextRequest) {
  if (!req.headers.get("content-type")?.includes("application/json")) throw new ApiError(415, "JSON body required.");
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) throw new ApiError(403, "Origin not allowed.");
}
