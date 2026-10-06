"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/animation/gsap";
import { useLenis } from "@/animation/LenisProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SceneView } from "@/three/canvas/SceneView";
import { scrollState } from "@/three/state/input";
import type { TransformationStage } from "@/types/content";
import { cn } from "@/lib/cn";

type Props = { stages: TransformationStage[]; fallback: ReactNode };

/**
 * Pinned, scroll-scrubbed transformation story.
 *
 * ONE ScrollTrigger drives everything:
 *   - pins the section for (stages − 1) screen-heights of scrolling
 *   - scrubs ONE GSAP timeline: text panels, progress rail, SVG fallback frames
 *   - onUpdate writes progress (0 → 5) into scrollState.story, which the 3D
 *     morph shader reads every frame — no React state, no re-renders.
 * Text and 3D share that single source of truth, so they can't drift apart.
 *
 * Reduced motion: no pin/scrub — stages render as a normal readable list and
 * the visual shows the final "Growth" formation.
 */
export function StoryScroller({ stages, fallback }: Props) {
  const root = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const reducedMotion = useReducedMotion();
  const lenisRef = useLenis();
  const last = stages.length - 1;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const fallbacks = q("[data-story-fallback]");

      if (reducedMotion) {
        scrollState.story = last;
        gsap.set(fallbacks, { opacity: (i: number) => (i === last ? 1 : 0) });
        return;
      }

      const panels = q("[data-stage-panel]");
      const labels = q("[data-stage-label]");

      // Timeline length = `last` units; stage k is fully shown at time k and
      // hands over to k+1 around k + 0.5.
      const tl = gsap.timeline({ defaults: { duration: 0.3, ease: "power2.inOut" } });
      tl.fromTo(q("[data-story-bar]"), { scaleY: 0 }, { scaleY: 1, ease: "none", duration: last }, 0);
      for (let k = 0; k < last; k++) {
        const at = k + 0.35;
        tl.to(panels[k], { autoAlpha: 0, y: -32 }, at)
          .fromTo(panels[k + 1], { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0 }, at + 0.15)
          .to(fallbacks[k], { opacity: 0 }, at)
          .to(fallbacks[k + 1], { opacity: 1 }, at);
      }
      tl.set({}, {}, last); // pad so the timeline is exactly `last` long

      let active = 0;
      triggerRef.current = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: () => `+=${window.innerHeight * last}`, // one screen per transition
        pin: true,
        scrub: true, // Lenis already smooths the scroll itself
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: tl,
        onUpdate: (self) => {
          scrollState.story = self.progress * last;
          // Highlight the current rail label by writing a data attribute
          // directly — CSS does the styling, React never re-renders.
          const idx = Math.round(self.progress * last);
          if (idx !== active) {
            labels[active]?.setAttribute("data-active", "false");
            labels[idx]?.setAttribute("data-active", "true");
            active = idx;
          }
        },
      });
    },
    { scope: root, dependencies: [reducedMotion, last], revertOnUpdate: true },
  );

  /** Rail click → smooth-scroll to the point where that stage is fully shown. */
  const goToStage = (k: number) => {
    const st = triggerRef.current;
    if (!st) return;
    const y = st.start + (k / last) * (st.end - st.start);
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section
      ref={root}
      id="approach"
      aria-labelledby="approach-heading"
      className={cn("relative", reducedMotion ? "py-24 md:py-32" : "h-dvh overflow-hidden")}
    >
      {/* Animated panels are aria-hidden; this list gives screen readers the full story at once. */}
      {!reducedMotion && (
        <ol className="sr-only">
          {stages.map((s) => (
            <li key={s.id}>
              {s.label}: {s.title}. {s.description}
            </li>
          ))}
        </ol>
      )}

      <div
        className={cn(
          "container-site grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12",
          reducedMotion
            ? "items-start"
            : "h-full grid-rows-[minmax(0,40%)_minmax(0,60%)] pt-20 lg:grid-rows-1 lg:pt-0",
        )}
      >
        {/* Visual (top on mobile, right on desktop) */}
        <div className={cn("relative order-first lg:order-last", reducedMotion ? "h-[50vh] lg:sticky lg:top-24 lg:h-[70vh] lg:self-start" : "h-full min-h-0")}>
          <SceneView scene="transformation" fallback={fallback} className="absolute inset-0" />
        </div>

        {/* Copy */}
        <div className="relative flex min-h-0 flex-col">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Our approach</p>
          <h2 id="approach-heading" className="mt-3 text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            From business challenge to measurable growth
          </h2>

          <div className="mt-8 flex gap-8 lg:mt-12">
            {/* Progress rail — desktop/tablet only, hidden for reduced motion */}
            {!reducedMotion && (
              <nav aria-label="Approach stages" className="relative hidden shrink-0 sm:block">
                <div aria-hidden="true" className="absolute bottom-2 left-[3px] top-2 w-px bg-line">
                  <div data-story-bar className="h-full w-full origin-top bg-gold" />
                </div>
                <ol className="space-y-3">
                  {stages.map((s, i) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        data-stage-label
                        data-active={i === 0}
                        onClick={() => goToStage(i)}
                        className="group flex items-center gap-4 text-sm text-subtle transition-colors duration-300 hover:text-fg data-[active=true]:text-gold"
                      >
                        <span className="h-[7px] w-[7px] rounded-full border border-line-strong bg-ink transition-colors duration-300 group-data-[active=true]:border-gold group-data-[active=true]:bg-gold" />
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Stage panels: stacked & crossfaded when animated, a plain list otherwise */}
            <div className={cn("relative flex-1", reducedMotion ? "space-y-12" : "min-h-[260px]")}>
              {stages.map((s, i) => (
                <article
                  key={s.id}
                  data-stage-panel
                  aria-hidden={reducedMotion ? undefined : true}
                  className={cn(!reducedMotion && "absolute inset-x-0 top-0", !reducedMotion && i > 0 && "invisible opacity-0")}
                >
                  <p className="font-mono text-xs tracking-widest text-gold">
                    {String(i + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")} · {s.label.toUpperCase()}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance md:text-3xl">{s.title}</h3>
                  <p className="mt-3 max-w-lg leading-relaxed text-muted">{s.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {s.deliverables.map((d) => (
                      <li key={d} className="rounded-full border border-line-strong bg-glass px-3 py-1 text-xs text-fg">
                        {d}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
