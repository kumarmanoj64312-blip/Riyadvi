import { z } from "zod";

/**
 * Server environment variables, validated once (on first use) with Zod.
 *
 * Lazy on purpose: Next imports route modules during `next build`, where the
 * database secrets may not exist. Validating at import time would break the
 * build; validating on first use gives a clear error in the server log
 * instead, and the request gets a clean 500.
 *
 * Next.js loads .env / .env.local automatically, so no dotenv is needed.
 */
const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

    // Email is optional: with no SMTP_HOST, notifications are skipped (logged).
    SMTP_HOST: z.string().optional().default(""),
    SMTP_PORT: z.coerce.number().int().default(587),
    SMTP_USER: z.string().optional().default(""),
    SMTP_PASS: z.string().optional().default(""),
    MAIL_FROM: z.string().default("Riyadvi Website <no-reply@riyadvisoftwaretechnologies.com>"),
    NOTIFY_TO: z.string().optional().default(""),

    // Admin dashboard: set ONE of ADMIN_PASSWORD (plain) or ADMIN_PASSWORD_HASH (bcrypt).
    ADMIN_EMAIL: z.string().trim().toLowerCase().pipe(z.email("ADMIN_EMAIL must be an email")),
    ADMIN_PASSWORD: z.string().min(1).optional(),
    ADMIN_PASSWORD_HASH: z.string().startsWith("$2", "ADMIN_PASSWORD_HASH must be a bcrypt hash").optional(),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: z.string().default("8h"),

    // The lead magnet PDF (served from /public).
    GUIDE_DOWNLOAD_URL: z.string().default("/downloads/riyadvi-software-project-planning-guide.pdf"),
  })
  .refine((e) => e.ADMIN_PASSWORD || e.ADMIN_PASSWORD_HASH, {
    message: "Set ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH)",
    path: ["ADMIN_PASSWORD"],
  });

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/** Validated env. Throws a readable error if something is missing or malformed. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error("Invalid server environment configuration:\n" + z.prettifyError(parsed.error));
  }
  cached = parsed.data;
  return cached;
}

export const isProd = process.env.NODE_ENV === "production";
