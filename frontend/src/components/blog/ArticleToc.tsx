"use client";

import { m } from "motion/react";
import { useEffect, useState } from "react";
import { useLenis } from "@/animation/LenisProvider";
import { cn } from "@/lib/cn";

export type TocHeading = { id: string; text: string };

/**
 * "On this page" navigation for long articles (desktop, sticky).
 *  - IntersectionObserver marks the heading currently in the reading zone
 *    (a band 20–30% from the top of the viewport) as active.
 *  - The gold indicator slides between items with a Motion `layoutId`
 *    animation instead of jumping.
 *  - Clicks scroll smoothly through Lenis (offset clears the fixed navbar);
 *    without Lenis (reduced motion) the plain #anchor link still works.
 */
export function ArticleToc({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState(headings[0]?.id);
  const lenisRef = useLenis();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="sticky top-28 hidden self-start xl:block">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-subtle">On this page</p>
      <ul className="mt-4 space-y-1 border-l border-line">
        {headings.map((h) => {
          const isActive = h.id === active;
          return (
            <li key={h.id} className="relative">
              {isActive && (
                <m.span
                  layoutId="toc-indicator"
                  aria-hidden="true"
                  className="absolute -left-px top-0 h-full w-0.5 bg-gold"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <a
                href={`#${h.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => {
                  const lenis = lenisRef?.current;
                  if (!lenis) return; // native anchor jump
                  e.preventDefault();
                  lenis.scrollTo(`#${h.id}`, { offset: -110 });
                  history.replaceState(null, "", `#${h.id}`);
                }}
                className={cn(
                  "block py-1.5 pl-4 text-sm leading-snug transition-colors duration-300",
                  isActive ? "text-gold" : "text-muted hover:text-fg",
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
