import { contentRoutes } from "@/server/utils/contentRoutes";

/** GET /api/projects — published projects (read-only). */
export const GET = contentRoutes("projects").list;
