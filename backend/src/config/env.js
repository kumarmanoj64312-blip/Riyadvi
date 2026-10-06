import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

/**
 * Environment variables, validated ONCE at startup. If something required is
 * missing or malformed the server refuses to boot with a clear message —
 * instead of failing later on the first request.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((v) => v.split(",").map((o) => o.trim()).filter(Boolean)),

  // Email is optional: with no SMTP_HOST, notifications are skipped (logged).
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().default("Riyadvi Website <no-reply@riyadvisoftwaretechnologies.com>"),
  NOTIFY_TO: z.string().optional().default(""),

  // Admin dashboard (single admin; generate the hash with `npm run hash-password -- "<password>"`)
  ADMIN_EMAIL: z.string().trim().toLowerCase().pipe(z.email("ADMIN_EMAIL must be an email")),
  // Set ONE of these: a plain password, or a bcrypt hash (`npm run hash-password`).
  ADMIN_PASSWORD: z.string().min(1).optional(),
  ADMIN_PASSWORD_HASH: z.string().startsWith("$2", "ADMIN_PASSWORD_HASH must be a bcrypt hash").optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("8h"),

  // Where the lead magnet PDF lives (served by the frontend's /public).
  GUIDE_DOWNLOAD_URL: z.string().default("/downloads/riyadvi-software-project-planning-guide.pdf"),
});

const parsed = schema
  .refine((e) => e.ADMIN_PASSWORD || e.ADMIN_PASSWORD_HASH, {
    message: "Set ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH)",
    path: ["ADMIN_PASSWORD"],
  })
  .safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment configuration:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
