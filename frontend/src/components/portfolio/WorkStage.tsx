"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { ScrollTrigger, useGSAP } from "@/animation/gsap";
import { useLenis } from "@/animation/LenisProvider";
import { ProjectCard, type ProjectCardData } from "@/components/portfolio/ProjectCard";
import { buttonClasses } from "@/components/ui/Button";
import { SceneView } from "@/three/canvas/SceneView";
import { workState } from "@/three/state/work";
import { cn } from "@/lib/cn";

/** Scroll distance (px) spent on each step from one project to the next. */
const PX_PER_PROJECT = 480;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Desktop/tablet case-study showcase: a 3D ring of project screens (WorkRing)
 * driven by scrolling.
 *
 *  - GSAP ScrollTrigger pins the stage in the middle of the screen; scrolling
 *    writes 0 → 1 progress into `workState`, and the ring turns right → left,
 *    bringing each project to the front.
 *  - The caption (industry, client, outcome, services, "Open case study")
 *    follows the front project. React re-renders only when the front project
 *    changes, never per scroll frame.
 *  - Dots jump to a project (keyboard-accessible); clicking the front screen
 *    in 3D opens its case study.
 *  - No WebGL / low-tier device → the front project's flat card is shown
 *    instead, and it still changes as you scroll.
 */
export function WorkStage({ projects, header }: { projects: ProjectCardData[]; header?: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const frontRef = useRef(0);
  const [front, setFront] = useState(0);
  const router = useRouter();
  const lenisRef = useLenis();
  const n = projects.length;

  const sceneParams = useMemo(
    () => ({
      projects: projects.map((p) => ({
        slug: p.slug,
        client: p.client,
        accent: p.accent,
        // The 3D row shows phones, so prefer each project's mobile screen.
        screen: (p.screens.find((s) => s.kind === "mobile") ?? p.screens[0])?.label ?? "Home",
      })),
    }),
    [projects],
  );

  // 3D → DOM: clicking the front screen opens the case study.
  useEffect(() => {
    workState.progress = 0;
    workState.onOpen = (slug) => router.push(`/portfolio/${slug}`);
    return () => {
      workState.onOpen = null;
    };
  }, [router]);

  useGSAP(
    () => {
      triggerRef.current = ScrollTrigger.create({
        trigger: rootRef.current,
        // The whole block (heading + 3D + caption) is exactly one screen tall and pins at the top.
        start: "top top",
        end: () => `+=${(n - 1) * PX_PER_PROJECT}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          workState.progress = self.progress;
          const i = Math.round(self.progress * (n - 1));
          if (i !== frontRef.current) {
            frontRef.current = i;
            setFront(i);
          }
        },
      });
      return () => {
        triggerRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [n] },
  );

  // Dots: scroll the page to the point where project i is at the front.
  const goTo = (i: number) => {
    const st = triggerRef.current;
    if (!st) return;
    const y = st.start + (i / Math.max(1, n - 1)) * (st.end - st.start) + 1;
    if (lenisRef?.current) lenisRef.current.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const p = projects[front];

  return (
    // ONE full-screen block, pinned as a whole: heading on top, the 3D row filling the
    // middle, and a single caption row at the bottom. pt clears the fixed navbar.
    <div ref={rootRef} className="flex h-dvh min-h-[600px] flex-col pb-6 pt-24">
      {header}

      <div data-scene-host className="relative mt-4 min-h-0 flex-1">
        <SceneView
          scene="work"
          params={sceneParams}
          className="absolute inset-0"
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[min(380px,70%)]">
                <ProjectCard project={p} />
              </div>
            </div>
          }
        />
      </div>

      {/* Caption row: project (left), services + action (right), dots (far right) */}
      <div className="mt-4 flex flex-col gap-4 border-t border-line pt-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="min-h-[5.5rem] min-w-0 flex-1" aria-live="polite">
          <AnimatePresence mode="wait">
            <m.div
              key={p.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8"
            >
              <div className="min-w-0">
                <p className="text-sm text-gold">{p.industry}</p>
                <h3 className="mt-1 text-display-md font-semibold">{p.client}</h3>
                <p className="mt-1 text-muted">{p.title}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
                <ul className="flex flex-wrap gap-1.5">
                  {p.serviceTitles.map((s) => (
                    <li key={s} className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-muted">
                      {s}
                    </li>
                  ))}
                </ul>
                <Link href={`/portfolio/${p.slug}`} className={buttonClasses({ size: "md" })} data-magnetic="">
                  Open case study
                </Link>
              </div>
            </m.div>
          </AnimatePresence>
        </div>

        <nav aria-label="Case studies" className="flex shrink-0 items-center gap-2">
          {projects.map((proj, i) => (
            <button
              key={proj.slug}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${proj.client}`}
              aria-current={i === front ? "true" : undefined}
              className="group flex h-8 min-w-6 items-center justify-center px-1"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-500 ease-premium",
                  i === front ? "w-8 bg-gold" : "w-1.5 bg-line-strong group-hover:bg-muted",
                )}
              />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
