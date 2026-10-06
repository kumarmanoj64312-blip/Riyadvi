"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { Job } from "@/types/content";
import { experienceLabel } from "@/lib/format";

const ALL = "all";

/** Experience bands for the filter. A job matches if its range genuinely overlaps the band. */
const BANDS = [
  { value: "0-1", label: "Fresher (0–1 yrs)", min: 0, max: 1 },
  { value: "1-3", label: "1–3 years", min: 1, max: 3 },
  { value: "3-5", label: "3–5 years", min: 3, max: 5 },
  { value: "5+", label: "5+ years", min: 5, max: 99 },
];

/** /careers listing with department, designation and experience filters. */
export function JobExplorer({ jobs }: { jobs: Job[] }) {
  const reduce = useReducedMotion();
  const [department, setDepartment] = useState(ALL);
  const [designation, setDesignation] = useState(ALL);
  const [experience, setExperience] = useState(ALL);

  const departments = useMemo(() => [...new Set(jobs.map((j) => j.department))], [jobs]);
  const designations = useMemo(() => [...new Set(jobs.map((j) => j.title))], [jobs]);

  const results = useMemo(() => {
    const band = BANDS.find((b) => b.value === experience);
    return jobs.filter(
      (j) =>
        (department === ALL || j.department === department) &&
        (designation === ALL || j.title === designation) &&
        // Half-open overlap: ranges that merely touch (1–3 yrs vs 0–1) don't count.
        (!band || (j.experience.min < band.max && j.experience.max > band.min)),
    );
  }, [jobs, department, designation, experience]);

  const select = "h-11 w-full rounded-full border border-line-strong bg-surface-2 px-4 text-sm text-fg focus:border-gold focus:outline-none";

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-subtle">
          Department
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className={select}>
            <option value={ALL}>All departments</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-subtle">
          Designation
          <select value={designation} onChange={(e) => setDesignation(e.target.value)} className={select}>
            <option value={ALL}>All designations</option>
            {designations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-subtle">
          Experience
          <select value={experience} onChange={(e) => setExperience(e.target.value)} className={select}>
            <option value={ALL}>Any experience</option>
            {BANDS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-subtle">
        {results.length} open {results.length === 1 ? "role" : "roles"}
      </p>

      <m.ul layout={!reduce} className="mt-4 space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {results.map((job) => (
            <m.li key={job.slug} layout={!reduce} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Link
                href={`/careers/${job.slug}`}
                className="group flex flex-col gap-4 rounded-2xl border border-line bg-surface-2 p-6 transition-colors duration-300 hover:border-gold/40 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">{job.department}</p>
                  <h3 className="mt-1 text-xl font-semibold group-hover:text-gold">{job.title}</h3>
                  <p className="mt-1 text-sm text-muted">{job.summary}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 text-xs text-muted md:justify-end">
                  {[experienceLabel(job.experience), job.type, job.location].map((t) => (
                    <span key={t} className="rounded-full border border-line px-3 py-1">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>

      {results.length === 0 && (
        <p className="mt-4 rounded-2xl border border-line p-8 text-center text-muted">
          No roles match right now — send us a general application at the bottom of this page.
        </p>
      )}
    </div>
  );
}
