"use client";

import { m, useReducedMotion } from "motion/react";

const STEPS = [
  { title: "Strategy", text: "Goals, audience, roadmap" },
  { title: "Design", text: "UX research & premium UI" },
  { title: "Development", text: "Web, app, cloud & 3D" },
  { title: "Marketing", text: "SEO, ads & content" },
  { title: "Optimization", text: "Analytics & experiments" },
  { title: "Growth", text: "Measurable, compounding results" },
];

/**
 * End-to-end journey: Strategy → Design → Development → Marketing →
 * Optimization → Growth. Motion `whileInView` with staggered children: each
 * node appears, then its connector draws toward the next — one partner,
 * no hand-offs.
 */
export function JourneyFlow() {
  const reduce = useReducedMotion();
  return (
    <m.ol
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ staggerChildren: 0.12 }}
      className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6"
    >
      {STEPS.map((s, i) => (
        <m.li
          key={s.title}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
          className="relative rounded-2xl border border-line bg-surface-2 p-5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 font-mono text-sm text-gold">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 font-semibold">{s.title}</h3>
          <p className="mt-1 text-sm text-muted">{s.text}</p>
          {/* Connector to the next step (desktop row only) */}
          {i < STEPS.length - 1 && (
            <m.span
              aria-hidden="true"
              variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { delay: 0.35, duration: 0.5 } } }}
              className="absolute -right-4 top-9 hidden h-px w-4 origin-left bg-gold lg:block"
            />
          )}
        </m.li>
      ))}
    </m.ol>
  );
}
