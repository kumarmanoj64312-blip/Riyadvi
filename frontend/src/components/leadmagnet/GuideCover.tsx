"use client";

import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";

/**
 * The guide as a physical book that tilts toward the cursor — pure CSS 3D
 * (preserve-3d + rotateX/Y) driven by Motion springs. Pointer position is a
 * motion value, so moving the mouse never re-renders React.
 */
export function GuideCover() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 150, damping: 18 };
  const rotateY = useSpring(useTransform(px, [-1, 1], [-22, 10]), spring);
  const rotateX = useSpring(useTransform(py, [-1, 1], [12, -12]), spring);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  return (
    <div
      aria-hidden="true"
      onPointerMove={onMove}
      onPointerLeave={() => (px.set(0), py.set(0))}
      className="flex items-center justify-center py-8 [perspective:1200px]"
    >
      <m.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ rotateY: -18 }}
        className="relative h-[380px] w-[270px] sm:h-[440px] sm:w-[312px]"
      >
        {/* Pages edge (gives the book thickness) */}
        <div
          className="absolute inset-y-2 right-0 w-6 rounded-r-md bg-[repeating-linear-gradient(90deg,#f5f5f4,#f5f5f4_2px,#d6d3c8_3px)]"
          style={{ transform: "translateZ(-12px) translateX(10px)" }}
        />
        {/* Front cover */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-md rounded-l-sm border border-gold/30 bg-ink p-7 shadow-[30px_40px_80px_-30px_rgb(212_175_55/0.35)]">
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-white/10 to-transparent" />
          <svg className="absolute -right-16 bottom-6 w-64 opacity-60" viewBox="0 0 200 200" fill="none" stroke="var(--color-gold-dark)">
            <path d="M30 60L80 30L140 45L180 90L170 150L120 175L60 165L30 120Z M80 30L100 100L140 45 M180 90L100 100L170 150 M120 175L100 100L60 165 M30 120L100 100L30 60" />
            <circle cx="100" cy="100" r="7" fill="var(--color-gold)" stroke="none" />
          </svg>
          <p className="text-xs font-semibold tracking-wide text-fg">
            Riyadvi<span className="text-gold">.</span>
          </p>
          <div className="relative">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">Free guide</p>
            <p className="mt-2 text-3xl font-semibold leading-tight tracking-tight">
              Software Project <span className="text-gold-gradient">Planning Guide</span>
            </p>
            <p className="mt-3 text-xs text-muted">6 steps · checklists · brief template</p>
          </div>
        </div>
      </m.div>
    </div>
  );
}
