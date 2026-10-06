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
 */
export function ProjectCard({ project }: { project: ProjectCardData }) {
  const screen = project.screens[0];
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      style={{ "--accent": project.accent } as CSSProperties}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface-2 transition-colors duration-500 hover:border-gold/40"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%)] p-8">
        <ScreenMock
          client={project.client}
          accent={project.accent}
          screen={screen}
          className={`transition-transform duration-700 ease-premium group-hover:-translate-y-1 group-hover:scale-[1.03] ${screen.kind === "mobile" ? "h-full w-auto" : ""}`}
        />
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
