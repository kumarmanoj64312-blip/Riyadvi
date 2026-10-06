/**
 * Date formatting done on the SERVER (fixed locale + UTC) so the text is
 * identical everywhere and client components never re-format it during
 * hydration (which could differ by timezone).
 */
const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00Z`));
}

/** "1–3 years" / "0–1 years" for a job's experience range. */
export function experienceLabel(e: { min: number; max: number }): string {
  return e.max <= 1 ? "0–1 years" : `${e.min}–${e.max} years`;
}

/** "05 Oct 2026, 4:30 pm" in IST — admin tables (server-rendered). */
const dateTimeFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}
