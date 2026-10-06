"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Live `prefers-reduced-motion` flag. Re-renders if the user flips the OS
 * setting while the page is open. Returns `false` on the server, so we render
 * the animated version by default and switch off motion after hydration.
 *
 * Used by Lenis (disable smooth scroll), GSAP sections and 3D scenes
 * (stop idle drift / auto-rotate).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
