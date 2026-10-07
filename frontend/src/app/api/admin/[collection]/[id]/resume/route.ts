import { Readable } from "node:stream";
import { ApiError, route } from "@/server/utils/http";
import { requireAdmin } from "@/server/utils/auth";
import { getResume } from "@/server/services/admin.service";

/** GET /api/admin/applications/:id/resume — stream the resume from GridFS (admins only). */
export const GET = route<{ collection: string; id: string }>(async (req, { collection, id }) => {
  requireAdmin(req);
  if (collection !== "applications") throw ApiError.notFound("Route not found");

  const { stream, resume, name } = await getResume(id);
  const ext = resume.filename.split(".").pop();
  const downloadName = `${name.replace(/[^\w ]+/g, "").trim().replace(/\s+/g, "-") || "resume"}-resume.${ext}`;

  // Node stream (GridFS) → Web stream (what a Route Handler Response accepts).
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": resume.contentType,
      "Content-Disposition": `attachment; filename="${downloadName}"`, // never render inline
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
});
