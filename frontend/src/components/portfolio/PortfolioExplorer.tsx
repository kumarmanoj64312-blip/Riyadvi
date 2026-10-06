"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ProjectCard, type ProjectCardData } from "@/components/portfolio/ProjectCard";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };
type Props = {
  projects: (ProjectCardData & { services: string[] })[];
  industries: string[];
  services: Option[];
};

const ALL = "all";

/**
 * Filterable portfolio grid (industry × service). Filtering is instant and
 * client-side — the full list is small and already server-rendered.
 * Motion `layout` animates cards sliding into their new positions;
 * AnimatePresence fades out the ones that no longer match.
 */
export function PortfolioExplorer({ projects, industries, services }: Props) {
  const reduce = useReducedMotion();
  const [industry, setIndustry] = useState(ALL);
  const [service, setService] = useState(ALL);

  const visible = useMemo(
    () =>
      projects.filter(
        (p) => (industry === ALL || p.industry === industry) && (service === ALL || p.services.includes(service)),
      ),
    [projects, industry, service],
  );

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <FilterGroup
          label="Industry"
          value={industry}
          onChange={setIndustry}
          options={[{ value: ALL, label: "All" }, ...industries.map((i) => ({ value: i, label: i }))]}
        />
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-subtle">Service</span>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="h-10 rounded-full border border-line-strong bg-surface-2 px-4 text-fg"
          >
            <option value={ALL}>All services</option>
            {services.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-subtle">
        Showing {visible.length} of {projects.length} projects
      </p>

      <m.ul layout={!reduce} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p) => (
            <m.li
              key={p.slug}
              layout={!reduce}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectCard project={p} />
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>

      {visible.length === 0 && (
        <div className="mt-6 rounded-2xl border border-line p-10 text-center text-muted">
          No projects match these filters yet.{" "}
          <button type="button" className="text-gold underline" onClick={() => (setIndustry(ALL), setService(ALL))}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Option[] }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-subtle">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-9 rounded-full border px-4 text-sm transition-colors duration-300",
              value === o.value ? "border-gold bg-gold text-ink" : "border-line-strong text-muted hover:border-gold/50 hover:text-fg",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
