import { ApiError } from "../utils/http.js";

/**
 * Generic read service for published content collections (services,
 * projects — and posts/jobs later). One implementation, many models.
 */
export function contentService(Model, label, baseFilter = {}) {
  const visible = { published: true, ...baseFilter };
  return {
    async list() {
      return Model.find(visible).sort({ order: 1, createdAt: 1 });
    },
    async getBySlug(slug) {
      const doc = await Model.findOne({ ...visible, slug: String(slug).toLowerCase() });
      if (!doc) throw ApiError.notFound(`${label} not found`);
      return doc;
    },
  };
}
