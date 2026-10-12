"use client";

import { useEffect, useRef } from "react";

/**
 * Thin gold bar pinned to the top of the viewport that fills as you read.
 * Progress is measured against the nearest `[data-reading]` ancestor (the
 * article column, not the related-posts section below it).
 * Written straight to `style.transform` (scaleX) once per frame at most —
 * no React state, no re-renders while scrolling.
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const column = bar?.closest<HTMLElement>("[data-reading]");
    if (!bar || !column) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = column.getBoundingClientRect();
      const scrollable = r.height - window.innerHeight;
      const p = scrollable > 0 ? Math.min(1, Math.max(0, -r.top / scrollable)) : 1;
      bar.style.transform = `scaleX(${p})`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold-dark via-gold-light to-gold shadow-[0_0_12px_var(--color-gold)]"
    />
  );
}
