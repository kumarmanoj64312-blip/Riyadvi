import { contentRoutes } from "@/server/utils/contentRoutes";

/** GET /api/posts — published posts (read-only). */
export const GET = contentRoutes("posts").list;
