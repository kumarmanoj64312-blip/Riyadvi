import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JobExplorer } from "@/components/careers/JobExplorer";
import { getJobs } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join Riyadvi Software Technologies — open roles in engineering, design and marketing.",
};

const PERKS = [
  { title: "Real ownership", text: "Small teams, real clients — your work ships and you see its impact." },
  { title: "Modern stack", text: "Next.js, React Three Fiber, Node.js, Figma — and time to learn what's next." },
  { title: "Mentorship", text: "Weekly reviews and pairing with senior engineers and designers." },
  { title: "Flexibility", text: "Hybrid working and outcome-based schedules." },
];

/** /careers — perks + filterable open roles. */
export default async function CareersPage() {
  const jobs = await getJobs();
  return (
    <>
      <section className="pb-16 pt-36 md:pt-44">
        <div className="container-site">
          <SectionHeading
            as="h1"
            eyebrow="Careers"
            title="Build what's next for growing businesses"
            description="We're a team of engineers, designers and marketers who care about craft and about results. Come do the best work of your career."
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.06} className="rounded-2xl border border-line bg-surface-2 p-6">
                <h2 className="font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm text-muted">{p.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="roles-heading" className="border-t border-line py-20">
        <div className="container-site">
          <h2 id="roles-heading" className="mb-8 text-3xl font-semibold tracking-tight">
            Open roles
          </h2>
          <JobExplorer jobs={jobs} />
          <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-line p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Don&apos;t see your role?</p>
              <p className="mt-1 text-sm text-muted">We&apos;re always happy to meet great people. Send your CV and a short note.</p>
            </div>
            <Button href={`mailto:${siteConfig.contact.email}?subject=General%20application`} variant="secondary">
              Email us your CV
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
