"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProjectCard, type ProjectCardData } from "@/components/portfolio/ProjectCard";
import { cn } from "@/lib/cn";

/**
 * Swipe carousel of case-study cards: phones and reduced motion. (Tablet and
 * desktop get the scroll-driven 3D ring instead; see WorkShowcase / WorkStage.)
 *
 * Built on NATIVE horizontal scrolling with CSS scroll-snap, not a JS slider:
 * touch swipe, trackpad and keyboard (focus the track, use arrow keys) all
 * work without JavaScript and stay accessible. JS only adds:
 *  - mouse drag-to-scroll (snap is paused while dragging, and the click that
 *    ends a drag is swallowed so it doesn't open a card by accident)
 *  - previous / next buttons that move one card at a time
 *  - disabled states at either end
 * Each card keeps its own tilt + screen-fan preview (data-tilt, PointerFX).
 */
type Props = {
  projects: ProjectCardData[];
  label: string;
  /** Optional closing card linking to the full list. */
  more?: { href: string; label: string };
};

export function ProjectCarousel({ projects, label, more }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  // Track scroll position → enable/disable the arrow buttons (state changes only at the ends).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const start = track.scrollLeft < 8;
      const end = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
      setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return; // touch uses native swipe
    const track = e.currentTarget;
    drag.current = { active: true, startX: e.clientX, startScroll: track.scrollLeft, moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    if (d.moved > 4) {
      const track = e.currentTarget;
      track.dataset.dragging = ""; // CSS: snap off + grabbing cursor
      if (!track.hasPointerCapture(e.pointerId)) track.setPointerCapture(e.pointerId);
      track.scrollLeft = d.startScroll - dx;
    }
  };
  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const track = e.currentTarget;
    delete track.dataset.dragging; // snap resumes and settles on the nearest card
    if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
  };

  return (
    <div>
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          // A drag ends with a click on whatever card is under the cursor; ignore it.
          if (drag.current.moved > 4) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = 0;
          }
        }}
        className={cn(
          "-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 pb-4 lg:-mx-[max(3rem,8vw)] lg:scroll-px-[max(3rem,8vw)] lg:px-[max(3rem,8vw)]",
          "cursor-grab [scrollbar-width:none] data-[dragging]:cursor-grabbing data-[dragging]:snap-none [&::-webkit-scrollbar]:hidden",
        )}
      >
        {projects.map((p) => (
          <li key={p.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
            <ProjectCard project={p} />
          </li>
        ))}
        {more && (
          <li className="w-[60%] shrink-0 snap-start sm:w-[30%] lg:w-[20%]">
            <Link
              href={more.href}
              className="group flex h-full min-h-64 flex-col items-start justify-end rounded-3xl border border-line p-6 transition-colors duration-500 hover:border-gold/40"
            >
              <span className="font-display text-display-md font-semibold text-balance">{more.label}</span>
              <span
                aria-hidden="true"
                className="mt-4 text-2xl text-gold transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </li>
        )}
      </ul>

      <div className="mt-6 flex items-center gap-3">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => step(dir)}
            disabled={dir === -1 ? edge.start : edge.end}
            aria-label={dir === -1 ? "Previous case studies" : "Next case studies"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-fg transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30"
          >
            <span aria-hidden="true">{dir === -1 ? "←" : "→"}</span>
          </button>
        ))}
        <p className="ml-2 text-sm text-subtle">Drag, swipe or use the arrows</p>
      </div>
    </div>
  );
}
