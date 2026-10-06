import type { Metadata } from "next";
import { LeadMagnetForm } from "@/components/forms/LeadMagnetForm";
import { GuideCover } from "@/components/leadmagnet/GuideCover";

export const metadata: Metadata = {
  title: "Software Project Planning Guide",
  description:
    "Download Riyadvi's free Software Project Planning Guide — six steps, checklists and a one-page brief template to plan a website, app or custom software project.",
};

const INSIDE = [
  "Why most software projects go over budget — and how to avoid it",
  "Turning business goals into a focused MVP scope",
  "Realistic budget and timeline ranges by project type",
  "Choosing technology that lasts five years",
  "How to pick a partner, not just a vendor",
  "Launch checklist + a one-page project brief template",
];

/** /software-project-planning-guide — lead magnet. */
export default function PlanningGuidePage() {
  return (
    <section className="pb-24 pt-36 md:pt-44">
      <div className="container-site grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Free resource</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Download Software Project Planning Guide
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            The planning framework we use with every client — condensed into a practical 6-page guide you can apply
            before you spend a rupee on development.
          </p>
          <GuideCover />
          <h2 className="text-lg font-semibold">What&apos;s inside</h2>
          <ul className="mt-4 space-y-3">
            {INSIDE.map((item) => (
              <li key={item} className="flex gap-3 text-muted">
                <span aria-hidden="true" className="text-gold">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 rounded-3xl border border-gold/30 bg-surface p-6 md:p-10 lg:sticky lg:top-28">
          <h2 className="text-2xl font-semibold tracking-tight">Get your free copy</h2>
          <p className="mt-2 text-muted">Instant download — no waiting for an email.</p>
          <div className="mt-8">
            <LeadMagnetForm />
          </div>
        </div>
      </div>
    </section>
  );
}
