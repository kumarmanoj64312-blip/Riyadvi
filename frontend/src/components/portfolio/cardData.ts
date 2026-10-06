import type { ProjectCardData } from "@/components/portfolio/ProjectCard";
import type { Project, Service } from "@/types/content";

/**
 * Shapes a Project for a card: only the fields the card needs, with service
 * slugs resolved to human titles. Keeps the server → client payload small.
 */
export function toCardData(project: Project, services: Service[]): ProjectCardData & { services: string[] } {
  const titleOf = (slug: string) => services.find((s) => s.slug === slug)?.title ?? slug;
  return {
    slug: project.slug,
    client: project.client,
    title: project.title,
    industry: project.industry,
    accent: project.accent,
    screens: project.screens,
    showcase: project.showcase,
    services: project.services,
    serviceTitles: project.services.map(titleOf),
  };
}
