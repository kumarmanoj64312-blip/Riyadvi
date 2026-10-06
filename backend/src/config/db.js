import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

/** Connects to MongoDB (local or Atlas). Throws if the first connection fails. */
export async function connectDB() {
  mongoose.set("strictQuery", true); // ignore unknown fields in query filters

  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));

  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  logger.info(`MongoDB connected → ${mongoose.connection.name}`);
}

/** Human-readable connection state for the health endpoint. */
export function dbState() {
  return ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] ?? "unknown";
}
