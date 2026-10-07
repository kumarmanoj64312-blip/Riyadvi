import { connectDB, dbState } from "@/server/config/db";
import { ok, route } from "@/server/utils/http";

/** GET /api/health — uptime monitors; also opens the DB connection early (warm-up). */
export const GET = route(
  async () => {
    await connectDB().catch(() => {}); // report the state instead of failing
    return ok({ uptime: Math.round(process.uptime()), db: dbState() }, { message: "ok" });
  },
  { db: false },
);
