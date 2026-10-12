"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/animation/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The page's ONE marquee: a band of what we build, between the technology
 * section and "Why Riyadvi". Purpose: a breathing break in the page rhythm
 * that shows breadth in a glance, without another grid of cards.
 *
 * Motion (GSAP):
 *  - an endless horizontal loop (two copies of the row, xPercent 0 → -50)
 *  - ScrollTrigger reads scroll VELOCITY: scrolling speeds the band up and
 *    scrolling up reverses it, then it eases back to its idle speed. So the
 *    band reacts to the visitor instead of just looping.
 *  - paused while off screen (ScrollTrigger onToggle)
 * Reduced motion → a static, wrapped row (no loop at all).
 */
export function CapabilityMarquee({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      const track = root.current?.querySelector<HTMLElement>("[data-track]");
      if (!track) return;

      const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
      let direction = 1;
      const settle = gsap.quickTo(loop, "timeScale", { duration: 1.2, ease: "power3.out" });

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        onUpdate: (self) => {
          const v = self.getVelocity(); // px/s, signed
          if (v !== 0) direction = v > 0 ? 1 : -1;
          // Burst proportional to scroll speed (capped), then quickTo eases back to idle.
          loop.timeScale(direction * Math.min(6, 1 + Math.abs(v) / 400));
          settle(direction);
        },
      });
    },
    { scope: root, dependencies: [reduce] },
  );

  const row = (copy: number) =>
    items.map((item, i) => (
      <li
        key={`${copy}-${item}`}
        aria-hidden={copy === 1 ? true : undefined}
        className="flex shrink-0 items-center gap-10 pr-10"
      >
        {/* Alternate filled and outlined type for rhythm */}
        <span
          className={
            i % 2 === 0
              ? "font-display text-display-lg font-semibold text-fg"
              : "font-display text-display-lg font-semibold text-transparent [-webkit-text-stroke:1px_var(--color-gold)]"
          }
        >
          {item}
        </span>
        <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-gold" />
      </li>
    ));

  return (
    <div ref={root} className="overflow-hidden border-y border-line py-10 md:py-14">
      <ul aria-label="What we build" data-track className={reduce ? "flex flex-wrap justify-center gap-y-4" : "flex w-max"}>
        {row(0)}
        {!reduce && row(1)}
      </ul>
    </div>
  );
}
