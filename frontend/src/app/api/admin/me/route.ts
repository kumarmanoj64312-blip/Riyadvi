import { ok, route } from "@/server/utils/http";
import { requireAdmin } from "@/server/utils/auth";

/** GET /api/admin/me — current admin. */
export const GET = route(
  async (req) => {
    const admin = requireAdmin(req);
    return ok({ email: admin.sub, role: admin.role });
  },
  { db: false },
);
