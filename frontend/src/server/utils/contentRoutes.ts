import { ok, route } from "./http";
import { contentServices, type ContentCollection } from "../services/content.service";

/**
 * GET list + GET by slug handlers for a public content collection
 * (services, projects, posts, jobs) — one factory, four route pairs.
 */
export function contentRoutes(collection: ContentCollection) {
  const service = contentServices[collection];
  return {
    list: route(async () => ok(await service.list())),
    detail: route<{ slug: string }>(async (_req, { slug }) => ok(await service.getBySlug(slug))),
  };
}
