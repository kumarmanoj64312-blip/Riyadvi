import Link from "next/link";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
import { experienceLabel, formatDate } from "@/lib/format";
import type { Job } from "@/types/content";

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-muted">
            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** ONE template for every /careers/[slug] job: details + application form. */
export function JobTemplate({ job }: { job: Job }) {
  const meta = [
    { label: "Department", value: job.department },
    { label: "Experience", value: experienceLabel(job.experience) },
    { label: "Type", value: job.type },
    { label: "Location", value: job.location },
  ];

  return (
    <article className="pb-8 pt-32 md:pt-40">
      <div className="container-site grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <nav aria-label="Breadcrumb" className="text-sm text-subtle">
            <Link href="/careers" className="hover:text-gold">
              Careers
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-muted">{job.department}</span>
          </nav>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance md:text-5xl">{job.title}</h1>
          <p className="mt-5 text-lg text-muted">{job.summary}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-line p-5 sm:grid-cols-4">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="text-xs uppercase tracking-[0.15em] text-subtle">{m.label}</dt>
                <dd className="mt-1 text-sm">{m.value}</dd>
              </div>
            ))}
          </dl>
          <Section title="What you'll do" items={job.responsibilities} />
          <Section title="What we're looking for" items={job.requirements} />
          <Section title="Nice to have" items={job.niceToHave} />
          <p className="mt-10 text-sm text-subtle">Posted {formatDate(job.postedAt)}</p>
        </div>

        <aside id="apply" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
          <div className="min-w-0 rounded-3xl border border-gold/30 bg-surface p-6 md:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">Apply for this role</h2>
            <p className="mt-2 text-sm text-muted">Takes two minutes. We reply to every applicant.</p>
            <div className="mt-6">
              <JobApplicationForm jobSlug={job.slug} position={job.title} />
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
