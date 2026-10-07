import { contentRoutes } from "@/server/utils/contentRoutes";

/** GET /api/posts/:slug — one published item or 404. */
export const GET = contentRoutes("posts").detail;
