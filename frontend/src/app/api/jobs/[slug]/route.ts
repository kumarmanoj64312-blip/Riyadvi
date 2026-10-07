import { contentRoutes } from "@/server/utils/contentRoutes";

/** GET /api/jobs/:slug — one published item or 404. */
export const GET = contentRoutes("jobs").detail;
