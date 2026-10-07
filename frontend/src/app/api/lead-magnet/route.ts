import { ok } from "@/server/utils/http";
import { formRoute } from "@/server/utils/forms";
import { leadMagnetSchema } from "@/server/validators/leads";
import { createLeadMagnetLead } from "@/server/services/lead.service";

/** POST /api/lead-magnet — store the lead, return the guide download URL. */
export const POST = formRoute(leadMagnetSchema, async (data, meta) => {
  const result = await createLeadMagnetLead(data, meta);
  return ok(result, { status: 201, message: "Your guide is ready to download." });
});
