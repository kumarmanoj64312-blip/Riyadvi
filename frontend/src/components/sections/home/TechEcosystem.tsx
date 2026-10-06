"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { SceneView } from "@/three/canvas/SceneView";
import { registerLabel, setHovered } from "@/three/state/constellation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Technology } from "@/types/content";
import { cn } from "@/lib/cn";

const RING_NAMES = ["Experience layer", "Engine", "Reach & delivery"];

/** Static stand-in (SSR, low-tier, no WebGL): concentric orbits + core. */
function ConstellationFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="h-4/5 max-h-[520px] w-auto" fill="none" stroke="var(--color-gold-dark)" role="presentation">
        <ellipse cx="200" cy="200" rx="80" ry="34" opacity=".6" />
        <ellipse cx="200" cy="200" rx="130" ry="60" opacity=".45" transform="rotate(-18 200 200)" />
        <ellipse cx="200" cy="200" rx="180" ry="80" opacity=".3" transform="rotate(14 200 200)" />
        <circle cx="200" cy="200" r="22" fill="var(--color-gold)" stroke="none" />
        {[[280, 200], [120, 200], [320, 160], [90, 250], [370, 230], [40, 180], [200, 120], [210, 285]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="var(--color-gold-light)" stroke="none" />
        ))}
      </svg>
    </div>
  );
}

/**
 * Home › Technology ecosystem — data-driven 3D constellation.
 * Labels and legend are real DOM (crisp, accessible); the 3D scene positions
 * the labels and reacts to hover/focus via the shared `constellation` bridge.
 */
export function TechEcosystem({ technologies }: { technologies: Technology[] }) {
  const [active, setActive] = useState<Technology | null>(null);
  const params = useMemo(
    () => ({ technologies: technologies.map(({ slug, ring }) => ({ slug, ring })) }),
    [technologies],
  );
  const categories = useMemo(() => [...new Set(technologies.map((t) => t.category))], [technologies]);

  const highlight = (t: Technology | null) => {
    setHovered(t?.slug ?? null, t?.ring);
    setActive(t); // re-render only on hover change (tooltip), never per frame
  };

  return (
    <section aria-labelledby="tech-heading" className="border-t border-line py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="Technology ecosystem"
          title={<span id="tech-heading">Modern, proven technology — connected around your business</span>}
          description="Hover a technology to pause its orbit and see how we use it. Drag to explore the ecosystem."
        />

        <div data-scene-host className="relative mt-10 h-[460px] cursor-grab overflow-hidden rounded-3xl border border-line sm:h-[560px] md:h-[620px]">
          <SceneView scene="tech" params={params} fallback={<ConstellationFallback />} className="absolute inset-0 touch-pan-y" />

          {/* Floating labels — positioned every frame by the 3D scene. Decorative
              duplicates of the legend below (aria-hidden, not focusable). */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {technologies.map((t) => (
              <span
                key={t.slug}
                ref={(el) => registerLabel(t.slug, el)}
                onPointerEnter={() => highlight(t)}
                onPointerLeave={() => highlight(null)}
                className={cn(
                  "pointer-events-none absolute left-0 top-0 flex cursor-default data-[placed=true]:pointer-events-auto items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs",
                  "opacity-0 transition-[background-color,border-color] duration-200 [will-change:transform] data-[placed=true]:opacity-100",
                  active?.slug === t.slug ? "border-gold bg-ink text-gold" : "border-line-strong bg-ink/80 text-fg",
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name}
              </span>
            ))}
          </div>

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
                <p className="text-xs uppercase tracking-[0.2em] text-gold">
                  {active.category} · {RING_NAMES[active.ring]}
                </p>
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
                          active?.slug === t.slug ? "border-gold text-gold" : "border-line-strong text-muted hover:text-fg",
                        )}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
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
