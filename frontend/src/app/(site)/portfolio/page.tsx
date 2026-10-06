import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PortfolioExplorer } from "@/components/portfolio/PortfolioExplorer";
import { toCardData } from "@/components/portfolio/cardData";
import { getProjects, getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Case studies from Riyadvi Software Technologies — websites, apps, AR/VR and marketing for healthcare, real estate, retail, beauty and life-science brands.",
};

/** /portfolio — server-renders all projects, then filters client-side. */
export default async function PortfolioPage() {
  const [projects, services] = await Promise.all([getProjects(), getServices()]);
  const industries = [...new Set(projects.map((p) => p.industry))].sort();
  const usedServices = services
    .filter((s) => projects.some((p) => p.services.includes(s.slug)))
    .map((s) => ({ value: s.slug, label: s.title }));

  return (
    <>
      <section className="pb-12 pt-36 md:pt-44">
        <div className="container-site">
          <SectionHeading
            as="h1"
            eyebrow="Portfolio"
            title="Work that moved the numbers"
            description="Selected projects across healthcare, real estate, retail, beauty and life sciences — each with the challenge, our approach and the results."
          />
        </div>
      </section>
      <section aria-labelledby="projects-heading" className="pb-24">
        <div className="container-site">
          <h2 id="projects-heading" className="sr-only">
            Projects
          </h2>
          <PortfolioExplorer
            projects={projects.map((p) => toCardData(p, services))}
            industries={industries}
            services={usedServices}
          />
        </div>
      </section>
    </>
  );
}
