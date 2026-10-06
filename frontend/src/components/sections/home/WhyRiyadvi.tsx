import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Timeline } from "@/components/company/Timeline";
import { JourneyFlow } from "@/components/company/JourneyFlow";
import { AREA_LABELS } from "@/data/healthCheckup";
import { getMilestones, getProjects, getServices } from "@/lib/content";
import { companyStats } from "@/lib/stats";

/**
 * Home › Why Riyadvi: derived stats · "Since 2021" timeline ·
 * Business Health Checkup explainer · end-to-end journey.
 */
export async function WhyRiyadvi() {
  const [milestones, projects, services] = await Promise.all([getMilestones(), getProjects(), getServices()]);
  const stats = companyStats(projects, services);

  return (
    <section aria-labelledby="why-heading" className="border-t border-line py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="Why Riyadvi"
          title={<span id="why-heading">A partner since 2021 — growing with every client</span>}
          description="We started by building websites. Our clients' ambitions pulled us into apps, marketing, 3D and strategy — so today one team owns the whole journey."
        />

        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink p-6 md:p-8">
              <dt className="text-sm text-subtle">{s.label}</dt>
              <dd className="text-gold-gradient mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-20">
          <h3 className="mb-10 text-sm font-medium uppercase tracking-[0.25em] text-gold">Since 2021</h3>
          <Timeline milestones={milestones} />
        </div>

        {/* Business Health Checkup explainer */}
        <Reveal className="relative mt-24 overflow-hidden rounded-3xl border border-gold/30 bg-surface-2 p-8 md:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(212_175_55/0.15),transparent_60%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Business Health Checkup</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
                We diagnose before we prescribe
              </h3>
              <p className="mt-4 text-muted">
                Every engagement starts by scoring four areas of your business. You see where the real growth
                opportunities are — and we only recommend work that moves those numbers.
              </p>
              <Button href="/business-health-checkup" className="mt-8">
                Take the free checkup
              </Button>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {Object.values(AREA_LABELS).map((label, i) => (
                <li key={label} className="rounded-2xl border border-line bg-ink/60 p-5">
                  <span className="font-mono text-xs text-gold">0{i + 1}</span>
                  <p className="mt-2 font-medium">{label}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="mt-24">
          <h3 className="text-sm font-medium uppercase tracking-[0.25em] text-gold">End-to-end solutions</h3>
          <p className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight md:text-3xl">One team, from first idea to measurable growth.</p>
          <div className="mt-10">
            <JourneyFlow />
          </div>
        </div>
      </div>
    </section>
  );
}
