"use client";

/**
 * Single GSAP entry point. Plugins are registered once here; every component
 * imports gsap/ScrollTrigger/useGSAP from this file instead of from "gsap"
 * directly, so registration can never be forgotten or duplicated.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Mobile browsers resize the viewport when the address bar shows/hides;
// re-measuring every pinned section on that causes visible jumps.
ScrollTrigger.config({ ignoreMobileResize: true });

// Mirrors --ease-premium in globals.css (cubic-bezier(0.22, 1, 0.36, 1)),
// which is very close to GSAP's built-in "expo.out".
export const EASE_PREMIUM = "expo.out";

export { gsap, ScrollTrigger, useGSAP };
