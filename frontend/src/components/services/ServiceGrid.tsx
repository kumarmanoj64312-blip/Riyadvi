import { ServiceTile } from "@/components/services/ServiceTile";
import type { Service } from "@/types/content";

/**
 * Column span on the 12-col desktop grid. Rows alternate 7/5 then 5/7, so the
 * grid zig-zags instead of forming identical columns (the "three equal cards"
 * template look). Works for any number of services: an odd last one spans
 * the full row.
 */
function spanFor(i: number, count: number) {
  if (i === count - 1 && count % 2 === 1) return "lg:col-span-12";
  const firstInRow = i % 2 === 0;
  const evenRow = Math.floor(i / 2) % 2 === 0;
  return firstInRow === evenRow ? "lg:col-span-7" : "lg:col-span-5";
}

/** Responsive grid of interactive service tiles (home + /services). */
export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
      {services.map((s, i) => (
        <div key={s.slug} className={spanFor(i, services.length)}>
          <ServiceTile
            index={i}
            // Only what the card needs crosses the server → client boundary.
            service={{
              slug: s.slug,
              title: s.title,
              tagline: s.tagline,
              sceneType: s.sceneType,
              highlights: s.features.slice(0, 3).map((f) => f.title),
            }}
          />
        </div>
      ))}
    </div>
  );
}
