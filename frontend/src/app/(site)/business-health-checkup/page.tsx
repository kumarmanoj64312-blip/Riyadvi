import type { Metadata } from "next";
import { HealthCheckup } from "@/components/checkup/HealthCheckup";
import { getServices } from "@/lib/content";
import { allQuestions } from "@/lib/checkup";

export const metadata: Metadata = {
  title: "Business Health Checkup",
  description:
    "Is your business ready for its next digital growth stage? Take Riyadvi's free 3-minute checkup and get your digital growth score with tailored recommendations.",
};

const BENEFITS = [
  // Count comes from the config, so it stays right when questions change.
  { title: "3 minutes", text: `${allQuestions.length} quick questions across five areas of your business.` },
  { title: "Instant score", text: "A 0–100 digital growth score with a breakdown by area." },
  { title: "Clear next steps", text: "The services that would move the needle most — no obligation." },
];

/** /business-health-checkup — lead-generation diagnostic. */
export default async function BusinessHealthCheckupPage() {
  const services = (await getServices()).map(({ slug, title, tagline }) => ({ slug, title, tagline }));

  return (
    <section className="pb-24 pt-36 md:pt-44">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.7fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Free Business Health Checkup</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Is Your Business Ready for Its Next Digital Growth Stage?
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            We use the same framework in our discovery workshops: website, marketing, technology and operations — scored
            honestly, with clear recommendations.
          </p>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-4">
                <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <span>
                  <span className="font-semibold">{b.title}</span>
                  <span className="block text-sm text-muted">{b.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <HealthCheckup services={services} />
        </div>
      </div>
    </section>
  );
}
