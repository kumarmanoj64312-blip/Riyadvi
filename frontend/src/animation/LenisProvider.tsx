"use client";

import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type GsapModule = typeof import("@/animation/gsap");

/*
 * Smooth scrolling + GSAP sync.
 *
 * How it works:
 * 1. Lenis intercepts wheel/touch and eases the *native* window scroll
 *    (it doesn't fake scrolling with transforms), so position: sticky,
 *    getBoundingClientRect and drei <View> all keep working.
 * 2. GSAP's ticker drives Lenis (autoRaf: false). One shared RAF loop means
 *    Lenis and ScrollTrigger always agree on the scroll position — no jitter
 *    in pinned/scrubbed sections.
 * 3. lagSmoothing(0) stops GSAP from "catching up" after a dropped frame,
 *    which would otherwise make scroll-linked animations jump.
 *
 * The instance is shared through a ref (not state) so reading it never
 * causes re-renders — consumers read `lenisRef.current` inside handlers or
 * animation frames.
 *
 * Performance: GSAP (~43 kB gz) is imported DYNAMICALLY here, so it isn't in
 * the shared bundle of every page. Native scrolling works until it arrives
 * (a few ms after hydration); pages with GSAP sections load it anyway.
 */

// Default is an empty ref so components (e.g. the Navbar on the 404 page)
// also work outside the provider — they just see "no Lenis" = native scroll.
const LenisContext = createContext<RefObject<Lenis | null>>({ current: null });

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();

  const gsapRef = useRef<GsapModule | null>(null);

  useEffect(() => {
    // Accessibility: users who ask for reduced motion get native scrolling.
    if (reducedMotion) return;

    let cancelled = false;
    let cleanup = () => {};

    import("@/animation/gsap").then((mod) => {
      if (cancelled) return;
      gsapRef.current = mod;
      const { gsap, ScrollTrigger } = mod;

      const lenis = new Lenis({
        lerp: 0.1, // 0–1: lower = smoother/heavier glide
        smoothWheel: true,
        autoRaf: false, // GSAP's ticker drives it (see below)
        anchors: true, // smooth-scroll in-page #hash links
      });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000); // GSAP time is in seconds
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33); // restore GSAP default
        lenis.destroy();
        lenisRef.current = null;
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reducedMotion]);

  // On client-side navigation jump instantly (no smooth glide through the old
  // page height) — to the #section if the URL has one (e.g. /contact#quote),
  // otherwise to the top — then let ScrollTrigger re-measure.
  useEffect(() => {
    // getElementById, not querySelector: a hash like "#1x" is an invalid CSS selector.
    const target = window.location.hash ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null;
    lenisRef.current?.scrollTo(target ?? 0, { immediate: true, offset: target ? -96 : 0 });
    gsapRef.current?.ScrollTrigger.refresh();
  }, [pathname]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}

/** Access the Lenis instance ref (e.g. lenisRef.current?.scrollTo("#id")). */
export function useLenis() {
  return useContext(LenisContext);
}
