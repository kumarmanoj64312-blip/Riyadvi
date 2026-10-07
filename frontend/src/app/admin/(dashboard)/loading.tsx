/**
 * Instant feedback while an admin page loads (Next.js streams this the moment
 * a sidebar link is clicked, instead of leaving the old page frozen).
 * Skeleton shapes match the dashboard/table layout to avoid layout jumps.
 */
export default function AdminLoading() {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-white/[0.06]" />
        <div className="h-4 w-72 max-w-full rounded bg-white/[0.04]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-[120px] rounded-2xl border border-line bg-white/[0.02]" />
        ))}
      </div>
      <div className="space-y-px overflow-hidden rounded-2xl border border-line">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 bg-white/[0.02]" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
