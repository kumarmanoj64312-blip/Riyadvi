/**
 * Loads .env / .env.local exactly the way `next dev` does, so CLI scripts
 * (seeders) see the same MONGODB_URI, ADMIN_* … as the running app.
 * Import this FIRST in every script.
 */
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
