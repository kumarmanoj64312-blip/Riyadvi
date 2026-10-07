import { contentRoutes } from "@/server/utils/contentRoutes";

/** GET /api/jobs — published jobs (read-only). */
export const GET = contentRoutes("jobs").list;
