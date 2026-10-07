import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

/*
 * MongoDB connection for a serverless / hot-reloading world.
 *
 * Route Handlers have no "server start" moment: on Vercel each function
 * instance boots cold, and in `next dev` modules re-evaluate on every edit.
 * So the connection is opened lazily on the first request and the PROMISE is
 * cached on globalThis — later requests (and concurrent ones) reuse it instead
 * of opening a new connection each time. A failed attempt is forgotten, so the
 * next request retries instead of being stuck on a rejected promise.
 */
type Cache = { promise: Promise<typeof mongoose> | null; listeners: boolean };
const g = globalThis as typeof globalThis & { __riyadviMongo?: Cache };
const cache: Cache = (g.__riyadviMongo ??= { promise: null, listeners: false });

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!cache.promise) {
    mongoose.set("strictQuery", true); // ignore unknown fields in query filters
    if (!cache.listeners) {
      mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
      mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));
      cache.listeners = true;
    }
    cache.promise = mongoose
      .connect(env().MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 10, // small pool: many short-lived function instances share one Atlas cluster
        bufferCommands: false, // fail fast instead of queueing queries while disconnected
      })
      .then((m) => {
        logger.info(`MongoDB connected → ${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  return cache.promise;
}

/** Human-readable connection state for the health endpoint. */
export function dbState(): string {
  return ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] ?? "unknown";
}
