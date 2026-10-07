import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/server/config/db";
import { SESSION_COOKIE, verifySession, type AdminSession } from "@/server/services/auth.service";
import { getStats, listLeads, type ListQuery } from "@/server/services/admin.service";

/*
 * SERVER-ONLY helpers for admin pages (imports next/headers + the database
 * layer, so it can never be bundled for the browser).
 *
 * Admin pages are Server Components running in the same app as the API, so
 * they call the admin services DIRECTLY — no HTTP round-trip to our own
 * /api routes. Unauthenticated visitors are redirected to /admin/login BEFORE
 * any protected HTML is sent: no flash of the dashboard, no client-side guard
 * to bypass.
 */
export { SESSION_COOKIE };

export type Paginated<T> = { items: T[]; total: number; page: number; pages: number; statuses: string[] };

/** Mongoose documents → plain JSON (applies toJSON: `id` instead of `_id`), safe to pass to Client Components. */
const toPlain = <T>(value: unknown): T => JSON.parse(JSON.stringify(value)) as T;

/** Valid session or redirect to the login page. */
export async function requireAdminSession(): Promise<AdminSession> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");
  try {
    return verifySession(token);
  } catch {
    redirect("/admin/login");
  }
}

export async function adminMe() {
  const session = await requireAdminSession();
  return { email: session.sub, role: session.role };
}

export async function adminStats<T>(): Promise<T> {
  await requireAdminSession();
  await connectDB();
  return toPlain<T>(await getStats());
}

export async function adminList<T>(collection: string, query: ListQuery = {}): Promise<Paginated<T>> {
  await requireAdminSession();
  await connectDB();
  return toPlain<Paginated<T>>(await listLeads(collection, query));
}
