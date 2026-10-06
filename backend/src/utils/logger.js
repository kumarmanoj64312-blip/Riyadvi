/**
 * Minimal structured logger. Kept dependency-free on purpose; swap for
 * pino/winston later without touching call sites.
 */
const stamp = () => new Date().toISOString();

export const logger = {
  info: (msg, meta) => console.log(`[${stamp()}] INFO  ${msg}`, meta ?? ""),
  warn: (msg, meta) => console.warn(`[${stamp()}] WARN  ${msg}`, meta ?? ""),
  error: (msg, meta) => console.error(`[${stamp()}] ERROR ${msg}`, meta ?? ""),
};
