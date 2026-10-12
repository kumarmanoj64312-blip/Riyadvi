"use client";

import { m, useReducedMotion } from "motion/react";

/** Same hiring process for every role, so it lives here rather than in each job's data (sample copy — confirm with HR). */
const STEPS = [
  { title: "Apply", text: "Send your details and resume in about two minutes." },
  { title: "Intro call", text: "A 20-minute chat about you and the role." },
  { title: "Practical task", text: "A short, real-world exercise based on the role." },
  { title: "Team conversation", text: "Meet the people you'll build with." },
  { title: "Offer", text: "A clear written offer and your next steps." },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * "How hiring works" — a track that draws itself (Motion scaleY / scaleX from
 * 0 → 1 when scrolled into view) while each step pops in along it, staggered.
 * Vertical on mobile, horizontal from `md`. Reduced motion → shown statically.
 */
export function HiringSteps() {
  const reduce = useReducedMotion();
  const inView = { once: true, margin: "0px 0px -15% 0px" } as const;

  return (
    <section aria-labelledby="hiring-heading" className="mt-14">
      <h2 id="hiring-heading" className="text-xl font-semibold">
        How hiring works
      </h2>
      <div className="relative mt-6">
        {/* The track: vertical line on mobile, horizontal on md+. */}
        <m.div
          aria-hidden="true"
          className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-gold to-gold/10 md:bottom-auto md:left-2 md:right-2 md:top-[7px] md:h-px md:w-auto md:origin-left md:bg-gradient-to-r"
          initial={reduce ? false : { scaleY: 0, scaleX: 0 }}
          whileInView={{ scaleY: 1, scaleX: 1 }}
          viewport={inView}
          transition={{ duration: 1.2, ease: EASE }}
        />
        <ol className="relative grid gap-6 md:grid-cols-5 md:gap-4">
          {STEPS.map((step, i) => (
            <m.li
              key={step.title}
              className="flex gap-4 md:flex-col md:gap-3"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.12 }}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-gold bg-ink shadow-[0_0_12px_-2px_var(--color-gold)] md:mt-0"
              />
              <div>
                <p className="text-sm font-semibold">
                  <span className="text-gold">{String(i + 1).padStart(2, "0")}</span> {step.title}
                </p>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            </m.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
