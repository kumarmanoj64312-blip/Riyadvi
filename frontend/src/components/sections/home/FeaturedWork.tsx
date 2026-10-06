import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { toCardData } from "@/components/portfolio/cardData";
import { getFeaturedProjects, getServices } from "@/lib/content";

/** Home › Featured portfolio — projects flagged `featured` in the data. */
export async function FeaturedWork() {
  const [projects, services] = await Promise.all([getFeaturedProjects(3), getServices()]);
  return (
    <section aria-labelledby="work-heading" className="border-t border-line py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="Selected work"
          title={<span id="work-heading">Partnerships that delivered measurable growth</span>}
          action={
            <Button href="/portfolio" variant="secondary">
              View all case studies
            </Button>
          }
        />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.08}>
              <ProjectCard project={toCardData(p, services)} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
