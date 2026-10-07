import { contentRoutes } from "@/server/utils/contentRoutes";

/** GET /api/services/:slug — one published item or 404. */
export const GET = contentRoutes("services").detail;
