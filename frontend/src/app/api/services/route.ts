import { contentRoutes } from "@/server/utils/contentRoutes";

/** GET /api/services — published services (read-only). */
export const GET = contentRoutes("services").list;
