import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const CTAS = [
  {
    eyebrow: "3-minute diagnostic",
    title: "Business Health Checkup",
    text: "Get your digital growth score across website, marketing, technology and operations — with clear next steps.",
    href: "/business-health-checkup",
    cta: "Start the checkup",
  },
  {
    eyebrow: "Free 6-page PDF",
    title: "Software Project Planning Guide",
    text: "Plan your website, app or software project like the experts — checklists, budgets and a brief template.",
    href: "/software-project-planning-guide",
    cta: "Download the guide",
  },
];

/** Home › Lead CTAs — the two value-first conversion paths. */
export function LeadCtas() {
  return (
    <section aria-label="Free resources" className="border-t border-line py-24">
      <div className="container-site grid gap-5 md:grid-cols-2">
        {CTAS.map((c, i) => (
          <Reveal key={c.href} delay={i * 0.08} className="group relative overflow-hidden rounded-3xl border border-line bg-surface-2 p-8 transition-colors duration-500 hover:border-gold/40 md:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/10 blur-3xl transition-transform duration-700 group-hover:scale-125" />
            <p className="relative text-sm font-medium uppercase tracking-[0.25em] text-gold">{c.eyebrow}</p>
            <h2 className="relative mt-3 text-3xl font-semibold tracking-tight">{c.title}</h2>
            <p className="relative mt-3 max-w-md text-muted">{c.text}</p>
            <Button href={c.href} variant={i === 0 ? "primary" : "secondary"} className="relative mt-8">
              {c.cta}
            </Button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
