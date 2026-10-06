import { sendSuccess } from "../utils/http.js";

/** Builds list/detail handlers for any content service (services, projects…). */
export function contentController(service) {
  return {
    list: async (_req, res) => sendSuccess(res, { data: await service.list() }),
    detail: async (req, res) => sendSuccess(res, { data: await service.getBySlug(req.params.slug) }),
  };
}
