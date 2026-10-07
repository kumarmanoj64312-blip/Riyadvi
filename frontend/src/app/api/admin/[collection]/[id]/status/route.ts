import { z } from "zod";
import { ok, readJson, route, validate } from "@/server/utils/http";
import { requireAdmin, requireSameOriginJson } from "@/server/utils/auth";
import { updateStatus } from "@/server/services/admin.service";

const statusSchema = z.object({ status: z.string().trim().min(1).max(20) });

/** PATCH /api/admin/:collection/:id/status — move a lead through the pipeline. */
export const PATCH = route<{ collection: string; id: string }>(async (req, { collection, id }) => {
  requireAdmin(req);
  requireSameOriginJson(req);
  const { status } = validate(statusSchema, await readJson(req));
  const doc = await updateStatus(collection, id, status);
  return ok({ id: doc.id, status: doc.status }, { message: "Status updated." });
});
