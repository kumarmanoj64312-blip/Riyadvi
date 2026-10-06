import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/*
 * Team notification emails for new leads.
 *
 * Rules:
 *  - Optional: with no SMTP_HOST configured, emails are skipped (logged).
 *  - NEVER blocks or fails the request: callers fire-and-forget. The lead is
 *    already saved in MongoDB before we even try to email.
 *  - All user input is HTML-escaped before going into the email body.
 */
let transporter = null;
function getTransporter() {
  if (!env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    connectionTimeout: 10_000,
  });
  return transporter;
}

const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/**
 * @param {string} subject
 * @param {Record<string, unknown>} fields  label → value, rendered as a table
 * @param {string} [replyTo]                lets the team reply to the lead directly
 */
export async function notifyTeam(subject, fields, replyTo) {
  const tx = getTransporter();
  if (!tx || !env.NOTIFY_TO) {
    logger.info(`Email skipped (SMTP not configured): ${subject}`);
    return;
  }
  const rows = Object.entries(fields)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#666">${escapeHtml(k)}</td><td style="padding:6px 12px">${escapeHtml(v)}</td></tr>`)
    .join("");
  await tx.sendMail({
    from: env.MAIL_FROM,
    to: env.NOTIFY_TO,
    replyTo,
    subject,
    text: Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `<h2 style="font-family:sans-serif">${escapeHtml(subject)}</h2><table style="font-family:sans-serif;border-collapse:collapse">${rows}</table>`,
  });
  logger.info(`Email sent: ${subject}`);
}

/** Fire-and-forget wrapper: logs failures, never throws. */
export function notifyTeamInBackground(subject, fields, replyTo) {
  notifyTeam(subject, fields, replyTo).catch((err) => logger.error(`Email failed: ${subject}`, err.message));
}
