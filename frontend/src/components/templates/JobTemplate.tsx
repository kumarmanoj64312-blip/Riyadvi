import Link from "next/link";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
import { HiringSteps } from "@/components/careers/HiringSteps";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { experienceLabel, formatDate } from "@/lib/format";
import type { Job } from "@/types/content";

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Reveal as="section" className="mt-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-muted">
            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
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
          <h1 className="text-display-xl mt-6 font-semibold text-balance">
            <SplitText text={job.title} trigger="load" />
          </h1>
          <p className="mt-5 text-lg text-muted">{job.summary}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-line p-5 sm:grid-cols-4">
            {meta.map((m, i) => (
              <Reveal key={m.label} delay={0.2 + i * 0.07}>
                <dt className="text-xs uppercase tracking-[0.15em] text-subtle">{m.label}</dt>
                <dd className="mt-1 text-sm">{m.value}</dd>
              </Reveal>
            ))}
          </dl>
          <Section title="What you'll do" items={job.responsibilities} />
          <Section title="What we're looking for" items={job.requirements} />
          <Section title="Nice to have" items={job.niceToHave} />
          <HiringSteps />
          <p className="mt-10 text-sm text-subtle">Posted {formatDate(job.postedAt)}</p>
        </div>

        <aside id="apply" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
          <Reveal delay={0.15} className="min-w-0 rounded-3xl border border-gold/30 bg-surface p-6 shadow-[0_0_60px_-30px_var(--color-gold)] md:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">Apply for this role</h2>
            <p className="mt-2 text-sm text-muted">Takes two minutes. We reply to every applicant.</p>
            <div className="mt-6">
              <JobApplicationForm jobSlug={job.slug} position={job.title} />
            </div>
          </Reveal>
        </aside>
      </div>
    </article>
  );
}
