import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePageTemplate } from "@/components/templates/ServicePageTemplate";
import { toCardData } from "@/components/portfolio/cardData";
import { getProjectsBySlugs, getService, getServices } from "@/lib/content";

/**
 * /services/[slug] — data → template → page.
 *
 * generateStaticParams pre-renders every known service at build time.
 * Slugs added later (new DB record) are rendered on first request, because
 * dynamic params are allowed (Next's default), then cached.
 */
export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: service.summary,
    openGraph: { title: `${service.title} | Riyadvi`, description: service.summary },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, all] = await Promise.all([getService(slug), getServices()]);
  if (!service) notFound();

  const others = all
    .filter((s) => s.slug !== service.slug)
    .map(({ slug, title, tagline }) => ({ slug, title, tagline }));

  const related = (await getProjectsBySlugs(service.relatedProjects)).map((p) => toCardData(p, all));

  return <ServicePageTemplate service={service} others={others} relatedProjects={related} />;
}
