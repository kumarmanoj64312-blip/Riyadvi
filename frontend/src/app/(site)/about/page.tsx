import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Timeline } from "@/components/company/Timeline";
import { JourneyFlow } from "@/components/company/JourneyFlow";
import { getCompanyProfile, getMilestones, getProjects, getServices } from "@/lib/content";
import { companyStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "About",
  description:
    "Riyadvi Software Technologies — a technology and digital solutions partner since 2021. Our story, vision, mission, values and journey.",
};

/** /about — story, vision & mission, values, approach, milestones, recognition. */
export default async function AboutPage() {
  const [company, milestones, projects, services] = await Promise.all([
    getCompanyProfile(),
    getMilestones(),
    getProjects(),
    getServices(),
  ]);
  const stats = companyStats(projects, services);

  return (
    <>
      {/* Story */}
      <section className="pb-20 pt-36 md:pt-44">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading
            as="h1"
            eyebrow="About Riyadvi · Founded 2021"
            title="Technology partner, not just a vendor"
          />
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            {company.story.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
        <div className="container-site">
          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-ink p-6 md:p-8">
                <dt className="text-sm text-subtle">{s.label}</dt>
                <dd className="text-gold-gradient mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Vision & mission */}
      <section className="border-t border-line py-24">
        <div className="container-site grid gap-6 md:grid-cols-2">
          {[
            { label: "Vision", text: company.vision },
            { label: "Mission", text: company.mission },
          ].map((b, i) => (
            <Reveal key={b.label} delay={i * 0.08} className="relative overflow-hidden rounded-3xl border border-line bg-surface-2 p-8 md:p-12">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(212_175_55/0.12),transparent_60%)]" />
              <h2 className="relative text-sm font-medium uppercase tracking-[0.25em] text-gold">{b.label}</h2>
              <p className="relative mt-4 text-2xl font-medium leading-snug tracking-tight text-balance md:text-3xl">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Values" title="What we stand for" />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {company.values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 0.06} className="rounded-2xl border border-line bg-surface-2 p-6">
                <span className="font-mono text-xs text-gold">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.description}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Approach */}
      <section className="border-t border-line py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Our approach"
            title="Diagnose, design, build, grow"
            description="Every engagement follows the same accountable path — strategy before code, measurement after launch."
          />
          <div className="mt-12">
            <JourneyFlow />
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="border-t border-line py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Milestones" title="Our journey since 2021" />
          <div className="mt-16">
            <Timeline milestones={milestones} />
          </div>
        </div>
      </section>

      {/* Recognition — rendered only when real entries exist in data/company.ts */}
      {company.recognition.length > 0 && (
        <section className="border-t border-line py-24">
          <div className="container-site">
            <SectionHeading eyebrow="Recognition" title="Awards & certifications" />
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {company.recognition.map((r) => (
                <li key={r.title} className="rounded-2xl border border-line bg-surface-2 p-6">
                  <p className="font-mono text-xs text-gold">{r.year}</p>
                  <h3 className="mt-2 font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted">{r.issuer}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="pb-8 pt-8">
        <div className="container-site flex flex-col items-start gap-6 rounded-3xl border border-gold/30 bg-surface-2 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">See our work in action</h2>
            <p className="mt-2 text-muted">Ten case studies across healthcare, retail, real estate and more.</p>
          </div>
          <Button href="/portfolio" size="lg">
            Explore the portfolio
          </Button>
        </div>
      </section>
    </>
  );
}
