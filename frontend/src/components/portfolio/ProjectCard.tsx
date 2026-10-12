import Link from "next/link";
import type { CSSProperties } from "react";
import { ScreenMock } from "@/components/portfolio/ScreenMock";
import type { Project } from "@/types/content";

export type ProjectCardData = Pick<Project, "slug" | "client" | "title" | "industry" | "accent" | "screens" | "showcase"> & {
  serviceTitles: string[];
};

/**
 * Portfolio card → links to the case study. No hooks, so it renders inside
 * both server pages and the client-side filter grid.
 *
 * Interactive preview (desktop):
 *  - `data-tilt`: <PointerFX> writes --tilt-x/--tilt-y/--glare-x/--glare-y
 *    while hovered → the card tilts in 3D and a soft glare follows the cursor.
 *  - The project's other screens sit hidden behind the main one and fan out
 *    on hover, previewing more of the project before you click.
 * CSS transforms only — no extra WebGL contexts for a grid of cards.
 */
export function ProjectCard({ project }: { project: ProjectCardData }) {
  const [screen, ...rest] = project.screens;
  const behind = rest.slice(0, 2); // up to two extra screens fan out on hover
  const mockSize = (kind: string) => (kind === "mobile" ? "h-full w-auto" : "");
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      data-tilt=""
      style={{ "--accent": project.accent } as CSSProperties}
      className="tilt-card group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface-2 hover:border-gold/40"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%)] p-8">
        {/* Extra screens, stacked behind the main one; fan out left/right on hover. */}
        {behind.map((s, i) => (
          <div
            key={s.label}
            aria-hidden="true"
            className={`absolute inset-8 flex items-center justify-center opacity-0 scale-90 transition-[translate,rotate,scale,opacity] duration-700 ease-premium group-hover:opacity-60 group-hover:scale-[0.82] ${
              i === 0 ? "group-hover:-translate-x-[22%] group-hover:-rotate-6" : "group-hover:translate-x-[22%] group-hover:rotate-6"
            }`}
          >
            {/* Ghost screen: frame + top bar + accent block (~4 elements, not a full ~25-element mock).
                These sit mostly hidden behind the main screen, so detail would be wasted DOM:
                a full mock here doubled the home page's DOM size (measured in Lighthouse). */}
            <div
              className={`overflow-hidden border border-line-strong bg-[#0c0c0c] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] ${
                s.kind === "mobile" ? "aspect-[9/19] h-full rounded-[2rem] p-3" : "aspect-[16/10] w-full rounded-xl p-3"
              }`}
            >
              <div className="h-2 w-1/3 rounded-full bg-white/10" />
              <div className="mt-3 h-1/3 rounded-lg bg-[linear-gradient(135deg,var(--accent),transparent)] opacity-70" />
            </div>
          </div>
        ))}
        <ScreenMock
          client={project.client}
          accent={project.accent}
          screen={screen}
          className={`relative transition-transform duration-700 ease-premium group-hover:-translate-y-1 group-hover:scale-[1.03] ${mockSize(screen.kind)}`}
        />
        {/* Glare that follows the cursor (position from PointerFX). */}
        <div aria-hidden="true" className="tilt-glare pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {project.showcase && (
          <span className="absolute right-4 top-4 rounded-full border border-gold/40 bg-ink/70 px-3 py-1 text-[11px] font-medium text-gold">
            Interactive 3D
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-subtle">{project.industry}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-gold">{project.client}</h3>
        <p className="mt-1 text-sm text-muted">{project.title}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
          {project.serviceTitles.map((t) => (
            <li key={t} className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-muted">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
