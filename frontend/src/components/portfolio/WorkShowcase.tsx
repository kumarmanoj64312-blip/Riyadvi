"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import type { ProjectCardData } from "@/components/portfolio/ProjectCard";
import { ProjectCarousel } from "@/components/portfolio/ProjectCarousel";
import { WorkStage } from "@/components/portfolio/WorkStage";

const QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Picks the case-study presentation for this device:
 *  - tablet/desktop with motion allowed → WorkStage (scroll-driven 3D ring)
 *  - phones / reduced motion → ProjectCarousel (native swipe carousel)
 *
 * The server (and the first client render) always produce the swipe carousel,
 * so the HTML works without JavaScript; capable screens switch after hydration
 * and follow window resizes via matchMedia.
 */
export function WorkShowcase({
  projects,
  more,
  header,
}: {
  projects: ProjectCardData[];
  more?: { href: string; label: string };
  /** Section heading: rendered inside the pinned stage (desktop) or above the carousel (phones). */
  header: ReactNode;
}) {
  const stage = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  return stage ? (
    <WorkStage projects={projects} header={header} />
  ) : (
    <>
      {header}
      <div className="mt-12">
        <ProjectCarousel projects={projects} label="Case studies" more={more} />
      </div>
    </>
  );
}
