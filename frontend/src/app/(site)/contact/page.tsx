import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/forms/ContactForm";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { getServices } from "@/lib/content";
import { siteConfig, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to Riyadvi Software Technologies — request a quote, book a free consultation, or reach us on WhatsApp.",
};

const EXTRA_REQUIREMENTS = [
  { value: "business-strategy", label: "Business strategy / consulting" },
  { value: "other", label: "Something else" },
];

/**
 * /contact — quote form (#quote), consultation booking (#consultation) and
 * direct channels. `?service=<slug>` pre-selects the requirement, so every
 * "Get a Quote" button lands with context.
 */
export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const [{ service }, services] = await Promise.all([searchParams, getServices()]);
  const requirements = [...services.map((s) => ({ value: s.slug, label: s.title })), ...EXTRA_REQUIREMENTS];
  const preselected = typeof service === "string" && requirements.some((r) => r.value === service) ? service : "";

  const channels = [
    { label: "WhatsApp", value: "Chat with our team", href: whatsappLink(), external: true },
    { label: "Email", value: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
    { label: "Phone", value: siteConfig.contact.phone, href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}` },
    { label: "Schedule directly", value: "Pick a time on Calendly", href: siteConfig.contact.calendly, external: true },
  ];

  return (
    <>
      <section className="pb-12 pt-36 md:pt-44">
        <div className="container-site">
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title="Let's talk about your next stage of growth"
            description="Tell us where you are and where you want to be. You'll hear back from a real person within one business day."
          />
        </div>
      </section>

      {/* Quote / contact form + channels */}
      <section id="quote" className="scroll-mt-28 pb-24">
        <div className="container-site grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0 rounded-3xl border border-line bg-surface p-6 md:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">Request a quote</h2>
            <p className="mt-2 text-muted">Share a few details and we&apos;ll come back with a clear scope and estimate.</p>
            <div className="mt-8">
              <ContactForm requirements={requirements} defaultRequirement={preselected} />
            </div>
          </div>

          <aside aria-label="Other ways to reach us" className="flex min-w-0 flex-col gap-4">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-gold/40"
              >
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-subtle">{c.label}</span>
                {/* overflow-wrap:anywhere lets a long email address wrap on small screens */}
                <span className="mt-2 flex items-center justify-between gap-3 text-lg font-medium [overflow-wrap:anywhere] group-hover:text-gold">
                  {c.value}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </a>
            ))}
            <div className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">
              <p className="font-medium text-fg">Office hours</p>
              <p className="mt-1">Monday – Saturday, 9:30 AM – 6:30 PM IST</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Consultation booking */}
      <section id="consultation" className="scroll-mt-28 border-t border-line py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeading
              eyebrow="Free consultation"
              title="30 minutes with a senior consultant"
              description="We'll review your goals, current setup and options — and you'll leave with clear next steps, whether or not we work together."
            />
            <ul className="mt-8 space-y-3 text-muted">
              {["No obligation, no sales pitch", "Video call or phone — your choice", "Written summary of recommendations"].map((t) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden="true" className="text-gold">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 rounded-3xl border border-gold/30 bg-surface p-6 md:p-10">
            <ConsultationForm requirements={requirements} />
          </div>
        </div>
      </section>
    </>
  );
}
