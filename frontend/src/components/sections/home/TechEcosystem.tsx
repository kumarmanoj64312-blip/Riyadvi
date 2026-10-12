"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { SceneView } from "@/three/canvas/SceneView";
import { constellation, setHovered } from "@/three/state/constellation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechLogo } from "@/components/tech/TechLogo";
import type { Technology } from "@/types/content";
import { cn } from "@/lib/cn";

/** Static stand-in (SSR, low-tier, no WebGL): the logo tiles on a ring around a gold core. */
function GlobeFallback({ technologies }: { technologies: Technology[] }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative aspect-square h-4/5 max-h-[520px]">
        <div className="absolute inset-[14%] rounded-full border border-gold/15" />
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold/80" />
        {technologies.map((t, i) => {
          const a = (i / technologies.length) * Math.PI * 2;
          return (
            <span
              key={t.slug}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-gold/60 bg-surface-2 text-fg"
              style={{ left: `${50 + Math.cos(a) * 40}%`, top: `${50 + Math.sin(a) * 40}%` }}
            >
              <TechLogo slug={t.slug} className="h-5 w-5" />
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Home › Technology ecosystem: data-driven 3D technology globe (TechGlobe).
 * Names and descriptions are real DOM (the legend + card below, accessible);
 * hover/focus in the legend drives the globe, and hovering a tile in the globe
 * updates the card, through the shared `constellation` bridge.
 */
export function TechEcosystem({ technologies }: { technologies: Technology[] }) {
  const [active, setActive] = useState<Technology | null>(null);
  const params = useMemo(
    () => ({ technologies: technologies.map(({ slug, ring }) => ({ slug, ring })) }),
    [technologies],
  );
  const categories = useMemo(() => [...new Set(technologies.map((t) => t.category))], [technologies]);

  const highlight = (t: Technology | null) => {
    setHovered(t?.slug ?? null);
    setActive(t); // re-render only on hover change (card), never per frame
  };

  // 3D → DOM: hovering a tile in the globe shows its card.
  useEffect(() => {
    constellation.onHover = (slug) => setActive(technologies.find((t) => t.slug === slug) ?? null);
    return () => {
      constellation.onHover = null;
      setHovered(null);
    };
  }, [technologies]);

  return (
    <section aria-labelledby="tech-heading" className="border-t border-line py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          titleId="tech-heading"
          title="Proven technology, connected around your business"
          description="Hover a technology to see how we use it. Drag to spin the globe."
        />

        <div
          data-scene-host
          className="relative mt-10 h-[460px] cursor-grab overflow-hidden rounded-3xl border border-line sm:h-[560px] md:h-[620px]"
        >
          <SceneView
            scene="tech"
            params={params}
            fallback={<GlobeFallback technologies={technologies} />}
            className="absolute inset-0 touch-pan-y"
          />

          {/* Tooltip for the active technology */}
          <AnimatePresence>
            {active && (
              <m.div
                key={active.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass pointer-events-none absolute bottom-4 left-4 right-4 max-w-sm rounded-2xl p-4 sm:right-auto"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-gold">{active.category}</p>
                <p className="mt-1 font-semibold">{active.name}</p>
                <p className="mt-1 text-sm text-muted">{active.usage}</p>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accessible legend: the same data as text; hover/focus drives the 3D too. */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-subtle">{cat}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {technologies
                  .filter((t) => t.category === cat)
                  .map((t) => (
                    <li key={t.slug}>
                      <button
                        type="button"
                        onPointerEnter={() => highlight(t)}
                        onPointerLeave={() => highlight(null)}
                        onFocus={() => highlight(t)}
                        onBlur={() => highlight(null)}
                        aria-describedby={active?.slug === t.slug ? "tech-usage" : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                          active?.slug === t.slug
                            ? "border-gold text-gold"
                            : "border-line-strong text-muted hover:text-fg",
                        )}
                      >
                        <TechLogo slug={t.slug} className="h-4 w-4" />
                        {t.name}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        <p id="tech-usage" className="sr-only" aria-live="polite">
          {active ? `${active.name}: ${active.usage}` : ""}
        </p>
      </div>
    </section>
  );
}
