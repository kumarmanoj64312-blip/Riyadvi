import { ok, route } from "@/server/utils/http";
import { SESSION_COOKIE, cookieOptions } from "@/server/services/auth.service";

/** POST /api/admin/logout — clear the session cookie. */
export const POST = route(
  async () => {
    const res = ok(undefined, { message: "Signed out." });
    res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
    return res;
  },
  { db: false },
);
