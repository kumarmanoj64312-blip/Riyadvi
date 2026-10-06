"use client";

import { useRef } from "react";
import { m } from "motion/react";
import { gsap, ScrollTrigger, useGSAP } from "@/animation/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Milestone } from "@/types/content";
import { cn } from "@/lib/cn";

/**
 * "Since 2021" company timeline — scroll-driven with GSAP ScrollTrigger:
 *  - the gold progress line fills as you scroll through the section (scrub)
 *  - each milestone card swings in from its side with a slight 3D rotation
 *  - oversized outline years drift at a different speed (parallax depth)
 *  - a milestone's dot lights up once the line reaches it
 * Motion adds the hover lift on cards. Reduced motion → static timeline.
 */
export function Timeline({ milestones }: { milestones: Milestone[] }) {
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(root);

      gsap.fromTo(
        q("[data-line-fill]"),
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: true } },
      );

      q("[data-milestone]").forEach((item, i) => {
        const fromLeft = i % 2 === 0;
        gsap.from(item.querySelector("[data-card]"), {
          opacity: 0,
          x: fromLeft ? -60 : 60,
          rotateY: fromLeft ? 14 : -14,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: item, start: "top 80%", toggleActions: "play none none reverse" },
        });
        gsap.to(item.querySelector("[data-year-bg]"), {
          yPercent: -40,
          ease: "none",
          scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
        });
        // Light the dot once the scroll position reaches this milestone.
        ScrollTrigger.create({
          trigger: item,
          start: "top 60%",
          onEnter: () => item.setAttribute("data-active", ""),
          onLeaveBack: () => item.removeAttribute("data-active"),
        });
      });
    },
    { scope: root, dependencies: [reduce], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="relative [perspective:1200px]">
      {/* Track + scrubbed fill (left on mobile, centred on desktop) */}
      <div aria-hidden="true" className="absolute bottom-0 left-4 top-0 w-px bg-line-strong md:left-1/2">
        <div data-line-fill className={cn("h-full w-full origin-top bg-gold", reduce && "scale-y-100")} />
      </div>

      <ol className="space-y-14 md:space-y-20">
        {milestones.map((milestone, i) => {
          const right = i % 2 === 1;
          return (
            <li
              key={milestone.year}
              data-milestone
              data-active={reduce ? "" : undefined}
              className="group relative grid pl-12 md:grid-cols-2 md:gap-16 md:pl-0"
            >
              {/* Dot on the line */}
              <span
                aria-hidden="true"
                className="absolute left-4 top-6 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-line-strong bg-ink transition-[background-color,border-color,box-shadow] duration-500 group-data-[active]:border-gold group-data-[active]:bg-gold group-data-[active]:shadow-[0_0_20px_var(--color-gold)] md:left-1/2"
              />
              {/* Parallax outline year (decorative depth layer) */}
              <span
                aria-hidden="true"
                data-year-bg
                className={cn(
                  "pointer-events-none absolute -top-6 hidden select-none text-[7rem] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgb(212_175_55/0.18)] md:block",
                  right ? "left-[8%]" : "right-[8%]",
                )}
              >
                {milestone.year}
              </span>
              <m.div
                data-card
                whileHover={reduce ? undefined : { y: -4 }}
                className={cn(
                  "relative rounded-2xl border border-line bg-surface-2 p-6 [transform-style:preserve-3d] md:p-8",
                  right ? "md:col-start-2" : "md:col-start-1 md:text-right",
                )}
              >
                <p className="text-gold-gradient text-3xl font-semibold tracking-tight">{milestone.year}</p>
                <h3 className="mt-2 text-xl font-semibold">{milestone.title}</h3>
                <p className="mt-2 text-muted">{milestone.description}</p>
              </m.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
