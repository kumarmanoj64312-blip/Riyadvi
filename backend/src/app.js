import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import adminRoutes from "./routes/admin.js";
import { apiLimiter } from "./middleware/spamProtection.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

/**
 * Express app (no network listen here — server.js does that), so the app can
 * be imported by tests or a serverless adapter.
 */
export const app = express();

// Behind Render's proxy: trust the first hop so req.ip / rate limiting use the
// real client address. (Set TRUST_PROXY higher if more proxies sit in front.)
app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 1));

app.use(helmet()); // secure headers (no-sniff, frame-ancestors, HSTS…)
app.use(
  cors({
    // Allow-list: only our frontends may call the API from a browser.
    // Requests without an Origin (server-to-server, curl, health checks) pass.
    origin(origin, cb) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error("CORS_NOT_ALLOWED"));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" })); // forms are small; reject huge bodies
app.use(cookieParser()); // reads the admin session cookie

app.get("/", (_req, res) => res.json({ success: true, message: "Riyadvi API — see /api/health" }));
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api", apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);
