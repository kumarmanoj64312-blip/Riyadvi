import type { Model } from "mongoose";
import { ApiError } from "../utils/errors";
import { Service } from "../models/Service";
import { Project } from "../models/Project";
import { Post } from "../models/Post";
import { Job } from "../models/Career";

/**
 * Generic read service for published content collections. One
 * implementation, many models.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function contentService(Model: Model<any>, label: string, baseFilter: Record<string, unknown> = {}) {
  const visible = { published: true, ...baseFilter };
  return {
    async list() {
      return Model.find(visible).sort({ order: 1, createdAt: 1 });
    },
    async getBySlug(slug: string) {
      const doc = await Model.findOne({ ...visible, slug: String(slug).toLowerCase() });
      if (!doc) throw ApiError.notFound(`${label} not found`);
      return doc;
    },
  };
}

/** The four public collections, shared by the /api routes and lib/content.ts. */
export const contentServices = {
  services: contentService(Service, "Service"),
  projects: contentService(Project, "Project"),
  posts: contentService(Post, "Post"),
  jobs: contentService(Job, "Job", { open: true }),
};

export type ContentCollection = keyof typeof contentServices;
