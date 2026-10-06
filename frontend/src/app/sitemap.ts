import type { MetadataRoute } from "next";
import { getJobs, getPosts, getProjects, getServices } from "@/lib/content";
import { siteConfig } from "@/lib/site";

/**
 * /sitemap.xml — generated from the same data layer as the pages, so every
 * new service, case study, post or job is listed automatically.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, posts, jobs] = await Promise.all([getServices(), getProjects(), getPosts(), getJobs()]);
  const url = (path: string) => `${siteConfig.url}${path}`;

  const staticPages = [
    "", "/services", "/portfolio", "/about", "/blog", "/careers", "/contact",
    "/business-health-checkup", "/software-project-planning-guide",
  ].map((path) => ({ url: url(path), changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.8 }));

  return [
    ...staticPages,
    ...services.map((s) => ({ url: url(`/services/${s.slug}`), priority: 0.9 })),
    ...projects.map((p) => ({ url: url(`/portfolio/${p.slug}`), priority: 0.7 })),
    ...posts.map((p) => ({ url: url(`/blog/${p.slug}`), lastModified: p.publishedAt, priority: 0.6 })),
    ...jobs.map((j) => ({ url: url(`/careers/${j.slug}`), lastModified: j.postedAt, priority: 0.5 })),
  ];
}
