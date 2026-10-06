import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyTemplate } from "@/components/templates/CaseStudyTemplate";
import { getProject, getProjects, getServices } from "@/lib/content";

/** /portfolio/[slug] — data → CaseStudyTemplate → page (same pattern as services). */
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Case study not found" };
  return {
    title: `${project.client} case study`,
    description: project.summary,
    openGraph: { title: `${project.client} — ${project.title}`, description: project.summary },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const [project, all, services] = await Promise.all([getProject(slug), getProjects(), getServices()]);
  if (!project) notFound();

  const related = services
    .filter((s) => project.services.includes(s.slug))
    .map(({ slug, title, tagline }) => ({ slug, title, tagline }));
  // Loop to the first project after the last one.
  const index = all.findIndex((p) => p.slug === project.slug);
  const nextProject = all[(index + 1) % all.length];

  return (
    <CaseStudyTemplate
      project={project}
      services={related}
      next={{ slug: nextProject.slug, client: nextProject.client, title: nextProject.title }}
    />
  );
}
