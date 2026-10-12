"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { SceneView } from "@/three/canvas/SceneView";
import { capabilityState } from "@/three/state/capabilities";

export type CapabilityLayer = {
  id: string;
  name: string;
  summary: string;
  links: { href: string; label: string }[];
};

const EASE = [0.22, 1, 0.36, 1] as const;
/** Vertical gap between planes (px) and how far the active plane lifts out. */
const GAP = 46;
const LIFT = 34;

/**
 * "How the business fits together" as a dimensional diagram: four stacked
 * planes in real CSS 3D space (perspective + preserve-3d), foundation at the
 * bottom (Strategy) up to the visible result (Growth).
 *
 *  - On scroll-in the planes assemble: they start collapsed into one slab and
 *    spread to their heights (Motion whileInView), so the stack "builds".
 *  - Hover / focus / tap a layer in the list: its plane lifts out of the stack
 *    and the others recede, and the panel shows that layer's actual services.
 *
 * The list is the accessible control (real buttons, aria-pressed); the stack
 * itself is decorative (aria-hidden) and mirrors the list's state.
 *
 * On capable devices the visual is the WebGL CapabilityScene (polished slabs,
 * light pillars, rising particles). These CSS planes are its static fallback:
 * shown on first paint, on low-tier devices and if WebGL fails. List and 3D
 * stay in sync both ways through `capabilityState` (no per-frame renders).
 */
export function CapabilityStack({ layers }: { layers: CapabilityLayer[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(layers.length - 1); // start at the top: the outcome
  const [built, setBuilt] = useState(false); // stack assembled (first time in view)
  const current = layers[active];
  const sceneParams = useMemo(() => ({ layers: layers.map((l) => l.name) }), [layers]);

  // DOM → 3D: the scene reads the active layer every frame.
  useEffect(() => {
    capabilityState.active = active;
  }, [active]);
  // 3D → DOM: hovering a slab in the scene selects that layer in the list.
  useEffect(() => {
    capabilityState.onPick = setActive;
    return () => {
      capabilityState.onPick = null;
    };
  }, []);

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      {/* The 3D stack: WebGL scene, with the CSS planes below as its fallback */}
      <div
        data-scene-host
        className="relative mx-auto aspect-square w-full max-w-[340px] sm:max-w-[460px] lg:order-2 lg:max-w-[560px]"
      >
        <SceneView
          scene="capabilities"
          params={sceneParams}
          className="absolute inset-0"
          fallback={
            <m.div
              aria-hidden="true"
              className="absolute inset-[6%] [perspective:1400px]"
              onViewportEnter={() => setBuilt(true)}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            >
              <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-38deg)]">
                {layers.map((layer, i) => {
                  const isActive = i === active;
                  const z = i * GAP + (isActive ? LIFT : 0) - ((layers.length - 1) * GAP) / 2;
                  const show = built || reduce;
                  return (
                    <m.div
                      key={layer.id}
                      className={cn(
                        "absolute inset-[14%] rounded-card border",
                        "bg-[linear-gradient(135deg,rgb(26_26_26/0.92),rgb(10_10_10/0.92))] shadow-inner-edge",
                        isActive ? "border-gold/70" : "border-line-strong",
                      )}
                      initial={reduce ? false : { z: 0, opacity: 0 }}
                      animate={show ? { z, opacity: isActive ? 1 : 0.55 } : { z: 0, opacity: 0 }}
                      // Stagger only the first assembly; later hover changes respond at once.
                      transition={{ duration: 0.9, ease: EASE, delay: built ? 0 : 0.08 * i }}
                      onPointerEnter={() => setActive(i)}
                    >
                      {/* Fine engineering grid printed on each plane */}
                      <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(rgb(212_175_55/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(212_175_55/0.07)_1px,transparent_1px)] bg-[size:28px_28px]" />
                      {/* Glow on the active plane */}
                      <div
                        className={cn(
                          "absolute inset-0 rounded-[inherit] shadow-[0_0_60px_-10px_var(--color-gold)] transition-opacity duration-500",
                          isActive ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="absolute bottom-4 left-5 font-display text-lg font-semibold tracking-tight text-fg/90">
                        {layer.name}
                      </span>
                    </m.div>
                  );
                })}
              </div>
            </m.div>
          }
        />
      </div>

      {/* Controls + detail */}
      <div>
        <ul>
          {/* Listed top-down (Growth first), the way people read a stack. */}
          {layers
            .map((layer, i) => ({ layer, i }))
            .reverse()
            .map(({ layer, i }) => (
              <li key={layer.id}>
                <button
                  type="button"
                  aria-pressed={i === active}
                  aria-controls="capability-detail"
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-6 border-b border-line py-4 text-left transition-colors duration-300",
                    i === active ? "text-fg" : "text-subtle hover:text-fg",
                  )}
                >
                  <span className="font-display text-display-md font-semibold">{layer.name}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "text-gold transition-[opacity,translate] duration-300 ease-premium",
                      i === active ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                    )}
                  >
                    →
                  </span>
                </button>
              </li>
            ))}
        </ul>

        <div id="capability-detail" aria-live="polite" className="mt-8 min-h-[9.5rem]">
          <AnimatePresence mode="wait">
            <m.div
              key={current.id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p className="max-w-[56ch] text-muted">{current.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {current.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center rounded-full border border-line-strong px-4 py-2 text-sm text-fg transition-colors hover:border-gold hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
