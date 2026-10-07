/**
 * Minimal structured logger. Kept dependency-free on purpose; swap for
 * pino/winston later without touching call sites.
 */
const stamp = () => new Date().toISOString();

export const logger = {
  info: (msg: string, meta?: unknown) => console.log(`[${stamp()}] INFO  ${msg}`, meta ?? ""),
  warn: (msg: string, meta?: unknown) => console.warn(`[${stamp()}] WARN  ${msg}`, meta ?? ""),
  error: (msg: string, meta?: unknown) => console.error(`[${stamp()}] ERROR ${msg}`, meta ?? ""),
};
