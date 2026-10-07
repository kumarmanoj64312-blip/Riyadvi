import type { z } from "zod";
import { formLimiter, rateLimit } from "./rateLimit";
import { honeypotResponse, honeypotTriggered, readJson, requestMeta, route, validate } from "./http";
import type { RequestMeta } from "../services/lead.service";

/**
 * Builds a POST handler for a JSON lead form. Same pipeline the Express
 * routes had, as plain function calls:
 *
 *   rate limit → read JSON (size-capped) → honeypot → Zod validation → use case
 */
export function formRoute<S extends z.ZodType>(schema: S, handle: (data: z.output<S>, meta: RequestMeta) => Promise<Response>) {
  return route(async (req) => {
    rateLimit(formLimiter, req);
    const body = await readJson(req);
    if (honeypotTriggered(body, req)) return honeypotResponse();
    return handle(validate(schema, body), requestMeta(req));
  });
}
