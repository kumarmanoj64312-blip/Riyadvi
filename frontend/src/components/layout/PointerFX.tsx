"use client";

import { useEffect } from "react";

/** How far a magnetic element follows the pointer (fraction of the distance), and its cap in px. */
const PULL = 0.3;
const MAX_PULL = 12;
/** Max tilt of `data-tilt` cards, in degrees. */
const TILT = 8;
const TILT_VARS = ["--tilt-x", "--tilt-y", "--glare-x", "--glare-y"];

/**
 * Desktop-only pointer micro-interactions, in one tiny client island:
 *
 *  1. Magnetic elements: anything marked `data-magnetic` (all primary /
 *     secondary <Button>s) leans toward the cursor while hovered and springs
 *     back on leave. Uses the CSS `translate` property, which is independent
 *     of `transform`, so it never fights a component's own hover/active scale.
 *  2. Tilt cards: anything marked `data-tilt` (portfolio cards) gets CSS
 *     variables for a 3D tilt + glare position; see .tilt-card in globals.css.
 *  3. Spotlight sections: `data-spotlight` gets --spot-x/--spot-y (px inside
 *     the element) for a light that follows the cursor (.spotlight in CSS).
 *
 * The native cursor is used as-is (no custom cursor graphic).
 * One delegated `pointermove` listener for the whole document: no per-element
 * listeners, no React state, nothing rendered.
 * Skipped entirely on touch devices and with reduced motion.
 */
export function PointerFX() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduce) return;

    let magnet: HTMLElement | null = null;
    let tilted: HTMLElement | null = null;
    let lit: HTMLElement | null = null;
    const offset = { x: 0, y: 0 }; // magnet's current pull, so its rect can be measured "at rest"

    const release = () => {
      if (magnet) magnet.style.translate = "";
      magnet = null;
      offset.x = offset.y = 0;
    };

    const untilt = () => {
      TILT_VARS.forEach((v) => tilted?.style.removeProperty(v));
      tilted = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX;
      const y = e.clientY;
      const target = e.target instanceof Element ? e.target : null;

      const card = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (card !== tilted) untilt();
      if (card) {
        const r = card.getBoundingClientRect();
        const px = (x - r.left) / r.width; // 0..1 across the card
        const py = (y - r.top) / r.height;
        card.style.setProperty("--tilt-x", `${((0.5 - py) * TILT).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${((px - 0.5) * TILT).toFixed(2)}deg`);
        card.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
        tilted = card;
      }

      const stage = target?.closest<HTMLElement>("[data-spotlight]") ?? null;
      if (stage !== lit) lit?.removeAttribute("data-lit");
      if (stage) {
        const r = stage.getBoundingClientRect();
        stage.style.setProperty("--spot-x", `${(x - r.left).toFixed(0)}px`);
        stage.style.setProperty("--spot-y", `${(y - r.top).toFixed(0)}px`);
        stage.setAttribute("data-lit", "");
      }
      lit = stage;

      const next = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (next !== magnet) release();
      if (!next) return;
      const r = next.getBoundingClientRect();
      const cx = r.left + r.width / 2 - offset.x;
      const cy = r.top + r.height / 2 - offset.y;
      const clampPull = (v: number) => Math.max(-MAX_PULL, Math.min(MAX_PULL, v));
      offset.x = clampPull((x - cx) * PULL);
      offset.y = clampPull((y - cy) * PULL);
      next.style.translate = `${offset.x}px ${offset.y}px`;
      magnet = next;
    };

    const onLeaveWindow = () => {
      release();
      untilt();
      lit?.removeAttribute("data-lit");
      lit = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      release();
      untilt();
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
    };
  }, []);

  return null;
}
