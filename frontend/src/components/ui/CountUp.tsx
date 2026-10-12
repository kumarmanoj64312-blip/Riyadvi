"use client";

import { useEffect, useRef } from "react";

/**
 * Counts a small whole number up from 0 when it scrolls into view, to draw the
 * eye to the figure. Anything else (a year like "2021", "24/7", "+48%") is
 * shown as-is: counting up a founding year means nothing.
 *
 * The server renders the FINAL value (correct for SEO, no-JS and screen
 * readers); the animation writes `textContent` directly per frame, so there
 * are no React re-renders. Reduced motion → the final value, no animation.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const target = /^\d{1,3}$/.test(value) ? Number(value) : null;
    if (!el || target === null || target === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.textContent = "0";
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const DURATION = 1200;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          el.textContent = String(Math.round(eased * target));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      // Start as soon as any of it is visible: a margin here could leave "0" on screen if the visitor stops scrolling.
      { threshold: 0 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
