import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { loginLimiter, requireAdmin } from "../middleware/auth.js";
import { SESSION_COOKIE, cookieOptions, login } from "../services/auth.service.js";
import { getCollection, getResume, getStats, listLeads, updateStatus } from "../services/admin.service.js";
import { ApiError, sendSuccess } from "../utils/http.js";

/**
 * /api/admin — everything below `requireAdmin` needs a valid session cookie.
 *
 *   POST  /login                      → set httpOnly session cookie
 *   POST  /logout                     → clear it
 *   GET   /me                         → current admin (used by the Next.js guard)
 *   GET   /stats                      → dashboard counts
 *   GET   /:collection                → enquiries | consultations | health-checkups | lead-magnet | applications
 *   PATCH /:collection/:id/status     → update pipeline status
 *   GET   /applications/:id/resume    → download resume from GridFS
 */
const router = Router();

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").max(120),
  password: z.string().min(1, "Password is required.").max(200),
});

router.post("/login", loginLimiter, validate(loginSchema), async (req, res) => {
  const token = await login(req.body.email, req.body.password);
  res.cookie(SESSION_COOKIE, token, cookieOptions());
  sendSuccess(res, { message: "Signed in." });
});

router.post("/logout", (_req, res) => {
  const { maxAge: _ignored, ...opts } = cookieOptions();
  res.clearCookie(SESSION_COOKIE, opts);
  sendSuccess(res, { message: "Signed out." });
});

router.use(requireAdmin);

router.get("/me", (req, res) => sendSuccess(res, { data: { email: req.admin.sub, role: req.admin.role } }));
router.get("/stats", async (_req, res) => sendSuccess(res, { data: await getStats() }));

router.get("/applications/:id/resume", async (req, res) => {
  const { stream, resume, name } = await getResume(req.params.id);
  const ext = resume.filename.split(".").pop();
  const downloadName = `${name.replace(/[^\w ]+/g, "").trim().replace(/\s+/g, "-") || "resume"}-resume.${ext}`;
  res.set({
    "Content-Type": resume.contentType,
    "Content-Disposition": `attachment; filename="${downloadName}"`, // never render inline
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  });
  stream.on("error", () => res.destroy());
  stream.pipe(res);
});

router.get("/:collection", async (req, res) => {
  getCollection(req.params.collection); // 404 for unknown collections
  sendSuccess(res, { data: await listLeads(req.params.collection, req.query) });
});

const statusSchema = z.object({ status: z.string().trim().min(1).max(20) });

/** CSRF hardening: state changes accept JSON only (a cross-site <form> can't send JSON). */
const requireJson = (req, _res, next) => {
  if (!req.is("application/json")) throw new ApiError(415, "JSON body required.");
  next();
};

router.patch("/:collection/:id/status", requireJson, validate(statusSchema), async (req, res) => {
  const doc = await updateStatus(req.params.collection, req.params.id, req.body.status);
  sendSuccess(res, { message: "Status updated.", data: { id: doc.id, status: doc.status } });
});

export default router;
