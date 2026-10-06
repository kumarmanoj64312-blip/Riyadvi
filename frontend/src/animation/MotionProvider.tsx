"use client";

import { LazyMotion } from "motion/react";

const loadFeatures = () => import("@/animation/motionFeatures").then((mod) => mod.default);

/**
 * Motion with a tiny initial footprint: components use the lightweight `m.*`
 * API and the animation engine arrives as a separate async chunk.
 * `strict` throws if anyone uses the full `motion.*` component by mistake,
 * which would silently pull the whole library back into every page.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
