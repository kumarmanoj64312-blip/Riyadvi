import { contentRoutes } from "@/server/utils/contentRoutes";

/** GET /api/projects/:slug — one published item or 404. */
export const GET = contentRoutes("projects").detail;
