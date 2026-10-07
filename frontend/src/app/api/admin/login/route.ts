import { z } from "zod";
import { ok, readJson, route, validate } from "@/server/utils/http";
import { loginLimiter, rateLimit } from "@/server/utils/rateLimit";
import { SESSION_COOKIE, cookieOptions, login } from "@/server/services/auth.service";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").max(120),
  password: z.string().min(1, "Password is required.").max(200),
});

/** POST /api/admin/login — verify credentials, set the httpOnly session cookie. */
export const POST = route(async (req) => {
  rateLimit(loginLimiter, req);
  const { email, password } = validate(loginSchema, await readJson(req));
  const token = await login(email, password);
  const res = ok(undefined, { message: "Signed in." });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions());
  return res;
});
