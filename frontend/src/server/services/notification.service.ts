import nodemailer, { type Transporter } from "nodemailer";
import { after } from "next/server";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/*
 * Team notification emails for new leads.
 *
 * Rules:
 *  - Optional: with no SMTP_HOST configured, emails are skipped (logged).
 *  - NEVER blocks or fails the request: the lead is already saved in MongoDB
 *    before we even try to email.
 *  - All user input is HTML-escaped before going into the email body.
 */
let transporter: Transporter | null = null;
function getTransporter() {
  const e = env();
  if (!e.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: e.SMTP_HOST,
    port: e.SMTP_PORT,
    secure: e.SMTP_PORT === 465,
    auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined,
    connectionTimeout: 10_000,
  });
  return transporter;
}

const escapeHtml = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * @param subject  email subject
 * @param fields   label → value, rendered as a table
 * @param replyTo  lets the team reply to the lead directly
 */
export async function notifyTeam(subject: string, fields: Record<string, unknown>, replyTo?: string) {
  const tx = getTransporter();
  if (!tx || !env().NOTIFY_TO) {
    logger.info(`Email skipped (SMTP not configured): ${subject}`);
    return;
  }
  const rows = Object.entries(fields)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#666">${escapeHtml(k)}</td><td style="padding:6px 12px">${escapeHtml(v)}</td></tr>`)
    .join("");
  await tx.sendMail({
    from: env().MAIL_FROM,
    to: env().NOTIFY_TO,
    replyTo,
    subject,
    text: Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n"),
    html: `<h2 style="font-family:sans-serif">${escapeHtml(subject)}</h2><table style="font-family:sans-serif;border-collapse:collapse">${rows}</table>`,
  });
  logger.info(`Email sent: ${subject}`);
}

/**
 * Sends the email AFTER the response has gone out, using Next's `after()`.
 * On serverless, plain fire-and-forget promises can be frozen the moment the
 * response is returned; `after()` keeps the function alive until the email
 * finishes. Outside a request (seed scripts) it falls back to a detached promise.
 * Logs failures, never throws.
 */
export function notifyTeamInBackground(subject: string, fields: Record<string, unknown>, replyTo?: string) {
  const send = () => notifyTeam(subject, fields, replyTo).catch((err) => logger.error(`Email failed: ${subject}`, err.message));
  try {
    after(send);
  } catch {
    void send();
  }
}
