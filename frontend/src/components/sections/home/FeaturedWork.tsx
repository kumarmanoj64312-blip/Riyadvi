import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkShowcase } from "@/components/portfolio/WorkShowcase";
import { toCardData } from "@/components/portfolio/cardData";
import { getProjects, getServices } from "@/lib/content";

const HOME_COUNT = 6;

/**
 * Home › Selected work: six case studies (featured first). Tablet/desktop: a
 * scroll-driven 3D ring of project screens; phones: a swipe carousel ending
 * with a link to the full portfolio. Each card tilts and fans out its screens on hover, and
 * opens its own /portfolio/[slug] case study.
 */
export async function FeaturedWork() {
  const [projects, services] = await Promise.all([getProjects(), getServices()]);
  // Six cards (featured first) keep the home page light; the carousel ends with a link to all of them.
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)].slice(0, HOME_COUNT);
  return (
    <section aria-labelledby="work-heading" className="overflow-hidden border-t border-line py-section">
      <div className="container-site">
        <WorkShowcase
          header={
            <SectionHeading
              eyebrow="Selected work"
              titleId="work-heading"
              title="Partnerships that delivered measurable growth"
              action={
                <Button href="/portfolio" variant="secondary">
                  All case studies
                </Button>
              }
            />
          }
          projects={ordered.map((p) => toCardData(p, services))}
          more={{ href: "/portfolio", label: `See all ${projects.length} case studies` }}
        />
      </div>
    </section>
  );
}
