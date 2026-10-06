import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";

/** Entry point: connect to MongoDB first, then accept traffic. */
async function start() {
  try {
    await connectDB();
  } catch (err) {
    logger.error("Could not connect to MongoDB — exiting.", err.message);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => logger.info(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`));

  // Graceful shutdown (Render/Railway send SIGTERM on redeploy).
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start();
