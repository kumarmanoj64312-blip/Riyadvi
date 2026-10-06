import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web development, app development, digital marketing, AR/VR, 3D modeling and UI/UX design — end-to-end digital services from Riyadvi Software Technologies.",
};

const PRINCIPLES = [
  { title: "Business first", description: "Every project starts from your goals and the metrics that prove success." },
  { title: "One accountable team", description: "Strategy, design, engineering and marketing under one roof." },
  { title: "Built to scale", description: "Modern, documented architecture that grows with you." },
  { title: "Partners after launch", description: "Support, optimisation and a roadmap — not a hand-off." },
];

/** /services — overview of all services, rendered from the data layer. */
export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <section className="pb-16 pt-36 md:pt-44">
        <div className="container-site">
          <SectionHeading
            as="h1"
            eyebrow="Services"
            title="Technology, design and growth — under one roof"
            description="We don't just deliver projects. We partner with you from the first business question to measurable growth, across six core capabilities."
          />
        </div>
      </section>

      <section aria-labelledby="all-services-heading" className="pb-24">
        <div className="container-site">
          {/* Keeps heading levels sequential (h1 → h2 → card h3) for screen readers. */}
          <h2 id="all-services-heading" className="sr-only">
            All services
          </h2>
          <ServiceGrid services={services} />
        </div>
      </section>

      <section aria-labelledby="principles-heading" className="border-t border-line py-24">
        <div className="container-site">
          <SectionHeading eyebrow="How we work" title={<span id="principles-heading">What every engagement includes</span>} />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.06} className="rounded-2xl border border-line bg-surface-2 p-6">
                <p className="font-mono text-xs text-gold">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
              </Reveal>
            ))}
          </ul>
          <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-gold/30 bg-surface-2 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Not sure which service you need?</h3>
              <p className="mt-1 text-muted">Take our free Business Health Checkup and get a tailored recommendation.</p>
            </div>
            <Button href="/business-health-checkup">Start the checkup</Button>
          </div>
        </div>
      </section>
    </>
  );
}
