import { ok } from "@/server/utils/http";
import { formRoute } from "@/server/utils/forms";
import { newsletterSchema } from "@/server/validators/leads";
import { subscribeToNewsletter } from "@/server/services/lead.service";

/**
 * POST /api/newsletter: rate-limited, honeypot-checked, Zod-validated (via formRoute).
 * 201 for a new subscriber, 200 if the address was already on the list. Same
 * friendly message either way, so the form can't be used to check whether an
 * address is subscribed.
 */
export const POST = formRoute(newsletterSchema, async (data, meta) => {
  const { created } = await subscribeToNewsletter(data, meta);
  return ok(undefined, { status: created ? 201 : 200, message: "You're subscribed. Thanks for following our work." });
});
