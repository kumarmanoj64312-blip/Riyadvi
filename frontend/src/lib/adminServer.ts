import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/*
 * SERVER-ONLY helper for admin pages (imports next/headers, so it can't be
 * bundled for the browser).
 *
 * Admin pages are Server Components: they call the Express admin API
 * directly, forwarding the visitor's httpOnly session cookie. Unauthenticated
 * visitors are redirected to /admin/login BEFORE any protected HTML is sent —
 * no flash of the dashboard, no client-side guard to bypass.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";
export const SESSION_COOKIE = "riyadvi_admin";

export type Paginated<T> = { items: T[]; total: number; page: number; pages: number; statuses: string[] };

export async function adminFetch<T>(path: string, query?: Record<string, string | undefined>): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");

  const qs = new URLSearchParams(Object.entries(query ?? {}).filter((e): e is [string, string] => Boolean(e[1]))).toString();
  const res = await fetch(`${BACKEND_URL}/api/admin${path}${qs ? `?${qs}` : ""}`, {
    headers: { cookie: `${SESSION_COOKIE}=${token}` },
    cache: "no-store", // private, per-request data — never cached
  });
  if (res.status === 401) redirect("/admin/login");
  const json = (await res.json()) as { success: boolean; message: string; data: T };
  if (!res.ok || !json.success) throw new Error(json.message || `Admin API error ${res.status}`);
  return json.data;
}
