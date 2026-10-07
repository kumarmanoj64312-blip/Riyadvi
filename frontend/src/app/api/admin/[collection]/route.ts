import { ok, route } from "@/server/utils/http";
import { requireAdmin } from "@/server/utils/auth";
import { listLeads } from "@/server/services/admin.service";

/**
 * GET /api/admin/:collection?status=&q=&page=&limit=
 * collection = enquiries | consultations | health-checkups | lead-magnet | applications
 */
export const GET = route<{ collection: string }>(async (req, { collection }) => {
  requireAdmin(req);
  const p = req.nextUrl.searchParams;
  return ok(await listLeads(collection, { status: p.get("status"), q: p.get("q"), page: p.get("page"), limit: p.get("limit") }));
});
