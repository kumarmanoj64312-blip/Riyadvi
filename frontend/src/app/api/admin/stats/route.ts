import { ok, route } from "@/server/utils/http";
import { requireAdmin } from "@/server/utils/auth";
import { getStats } from "@/server/services/admin.service";

/** GET /api/admin/stats — dashboard counts per lead type. */
export const GET = route(async (req) => {
  requireAdmin(req);
  return ok(await getStats());
});
