"use client";

import { useEffect } from "react";
import Link from "next/link";
import { animate, m, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { AREA_LABELS, type CheckupArea } from "@/data/healthCheckup";
import type { CheckupResult } from "@/lib/checkup";
import { Button } from "@/components/ui/Button";

export type ServiceSummary = { slug: string; title: string; tagline: string };

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Plain-language verdict for the overall score. */
function verdict(score: number) {
  if (score >= 75) return { title: "Ready to scale", text: "Strong digital foundations — the next gains come from optimisation and new channels." };
  if (score >= 50) return { title: "Growing, with gaps", text: "Good foundations, but a few weak spots are quietly costing you leads and time." };
  return { title: "Big opportunity ahead", text: "Fixing the fundamentals below will likely give you the fastest growth of any investment." };
}

/**
 * Results screen: animated score ring + per-area bars + recommended services.
 * The score comes from the server (single source of truth for scoring).
 */
export function CheckupResults({ result, services, onRestart }: { result: CheckupResult; services: ServiceSummary[]; onRestart: () => void }) {
  const reduce = useReducedMotion();
  const { total, areas } = result.score;
  const v = verdict(total);
  const recs = result.recommendations
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is ServiceSummary => Boolean(s));

  // Count-up number and ring fill driven by one motion value (no re-renders).
  const progress = useMotionValue(reduce ? total : 0);
  const display = useTransform(progress, (p) => Math.round(p));
  const dashOffset = useTransform(progress, (p) => CIRCUMFERENCE * (1 - p / 100));
  useEffect(() => {
    if (reduce) return;
    const controls = animate(progress, total, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [progress, total, reduce]);

  return (
    <section aria-labelledby="results-heading" className="rounded-3xl border border-gold/30 bg-surface p-6 sm:p-10">
      <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
        <div className="relative mx-auto h-44 w-44" role="img" aria-label={`Digital growth score: ${total} out of 100`}>
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="var(--color-line-strong)" strokeWidth="10" />
            <m.circle
              cx="80"
              cy="80"
              r={RADIUS}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <m.span className="text-5xl font-semibold tracking-tight">{display}</m.span>
            <span className="text-xs text-subtle">out of 100</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Your digital growth score</p>
          <h2 id="results-heading" className="mt-2 text-3xl font-semibold tracking-tight">
            {v.title}
          </h2>
          <p className="mt-2 max-w-xl text-muted">{v.text}</p>

          <ul className="mt-6 space-y-3">
            {Object.entries(areas).map(([area, score], i) => (
              <li key={area}>
                <div className="flex justify-between text-sm">
                  <span>{AREA_LABELS[area as CheckupArea] ?? area}</span>
                  <span className="text-muted">{score}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line-strong">
                  {/* scaleX (transform) instead of width → no layout work per frame */}
                  <m.div
                    className="h-full origin-left rounded-full bg-gold"
                    initial={{ scaleX: reduce ? score / 100 : 0 }}
                    animate={{ scaleX: score / 100 }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {recs.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold">Where we&apos;d focus first</h3>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {recs.map((s, i) => (
              <m.li
                key={s.slug}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <Link href={`/services/${s.slug}`} className="group block h-full rounded-2xl border border-line p-5 transition-colors hover:border-gold/40">
                  <span className="font-mono text-xs text-gold">0{i + 1}</span>
                  <span className="mt-1 block font-semibold group-hover:text-gold">{s.title}</span>
                  <span className="mt-1 block text-sm text-muted">{s.tagline}</span>
                </Link>
              </m.li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button href="/contact#consultation" size="lg">
          Discuss my results
        </Button>
        <Button href="/software-project-planning-guide" variant="secondary" size="lg">
          Get the guide
        </Button>
        <button type="button" onClick={onRestart} className="text-sm text-subtle hover:text-gold sm:ml-auto">
          Retake the checkup
        </button>
      </div>
      <p className="mt-6 text-xs text-subtle">A copy of your results has been sent to our team — we&apos;ll be in touch within one business day.</p>
    </section>
  );
}
