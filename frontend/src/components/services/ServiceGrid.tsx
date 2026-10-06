import { ServiceTile } from "@/components/services/ServiceTile";
import type { Service } from "@/types/content";

/** Responsive grid of interactive service tiles (home + /services). */
export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => (
        <ServiceTile
          key={s.slug}
          index={i}
          // Only what the card needs crosses the server → client boundary.
          service={{ slug: s.slug, title: s.title, tagline: s.tagline, sceneType: s.sceneType }}
        />
      ))}
    </div>
  );
}
