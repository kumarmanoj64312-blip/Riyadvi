/**
 * Data-access layer — the ONLY place pages/components get content from.
 *
 *   CONTENT_SOURCE=local (default) → typed objects in src/data/*
 *   CONTENT_SOURCE=api             → MongoDB (same app, via src/server), with
 *                                    the local data as a safety net if the DB
 *                                    is unreachable
 *
 * Swapping in Strapi / Sanity / WordPress later means changing `fromDb`
 * here — no component changes.
 *
 * "Add a service without rebuilding": with the DB source, query results are
 * cached for REVALIDATE seconds (ISR via unstable_cache). A new DB record
 * appears on the next revalidation, and an unknown /services/[slug] is
 * rendered on demand because dynamic params are allowed (Next's default).
 */
import { unstable_cache } from "next/cache";
import { connectDB } from "@/server/config/db";
import { contentServices, type ContentCollection } from "@/server/services/content.service";
import { services as localServices } from "@/data/services";
import { projects as localProjects } from "@/data/projects";
import { transformationStages as localStages } from "@/data/transformation";
import { technologies as localTechnologies } from "@/data/technologies";
import { company as localCompany, milestones as localMilestones } from "@/data/company";
import { posts as localPosts } from "@/data/posts";
import { jobs as localJobs } from "@/data/jobs";
import type { CompanyProfile, Job, Milestone, Post, Project, Service, Technology, TransformationStage } from "@/types/content";

const SOURCE = process.env.CONTENT_SOURCE === "api" ? "api" : "local";
const REVALIDATE = 60; // seconds

/**
 * Reads a published collection (or one item by slug) straight from MongoDB —
 * the same content service the public /api routes use, without an HTTP hop.
 * Results are serialised to plain JSON and cached for REVALIDATE seconds.
 * Returns null on any failure (DB down, unknown slug, env missing at build
 * time) so callers fall back to local content instead of breaking the page.
 */
async function fromDb<T>(collection: ContentCollection, slug: string | null, tags: string[]): Promise<T | null> {
  if (SOURCE !== "api") return null;
  try {
    const load = unstable_cache(
      async () => {
        await connectDB();
        const service = contentServices[collection];
        const result = slug ? await service.getBySlug(slug) : await service.list();
        return JSON.parse(JSON.stringify(result)) as T; // toJSON: `id` instead of `_id`
      },
      ["content", collection, slug ?? "*"],
      { revalidate: REVALIDATE, tags },
    );
    return await load();
  } catch {
    return null;
  }
}

/* ─── Services ─────────────────────────────────────────────────────────── */

export async function getServices(): Promise<Service[]> {
  return (await fromDb<Service[]>("services", null, ["services"])) ?? localServices;
}

export async function getService(slug: string): Promise<Service | null> {
  const remote = await fromDb<Service>("services", slug, ["services", `service:${slug}`]);
  return remote ?? localServices.find((s) => s.slug === slug) ?? null;
}

/* ─── Portfolio ────────────────────────────────────────────────────────── */

export async function getProjects(): Promise<Project[]> {
  return (await fromDb<Project[]>("projects", null, ["projects"])) ?? localProjects;
}

export async function getProject(slug: string): Promise<Project | null> {
  const remote = await fromDb<Project>("projects", slug, ["projects", `project:${slug}`]);
  return remote ?? localProjects.find((p) => p.slug === slug) ?? null;
}

/** Projects in the given slug order (unknown slugs are skipped). */
export async function getProjectsBySlugs(slugs: string[]): Promise<Project[]> {
  const all = await getProjects();
  return slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is Project => Boolean(p));
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const all = await getProjects();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/* ─── Home: transformation story ──────────────────────────────────────── */

export async function getTransformationStages(): Promise<TransformationStage[]> {
  return localStages; // static marketing copy — not CMS-managed yet
}

/* ─── Company: technologies, milestones, profile ─────────────────────── */

export async function getTechnologies(): Promise<Technology[]> {
  return localTechnologies;
}

export async function getMilestones(): Promise<Milestone[]> {
  return [...localMilestones].sort((a, b) => a.year - b.year);
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  return localCompany;
}

/* ─── Blog ─────────────────────────────────────────────────────────────── */

const byNewest = (a: Post, b: Post) => b.publishedAt.localeCompare(a.publishedAt);

export async function getPosts(): Promise<Post[]> {
  const list = (await fromDb<Post[]>("posts", null, ["posts"])) ?? localPosts;
  return [...list].sort(byNewest);
}

export async function getPost(slug: string): Promise<Post | null> {
  const remote = await fromDb<Post>("posts", slug, ["posts", `post:${slug}`]);
  return remote ?? localPosts.find((p) => p.slug === slug) ?? null;
}

/** Most related posts: shared tags score 2 each, same category scores 1. */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const all = await getPosts();
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => post.tags.includes(t)).length * 2 + (p.category === post.category ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || byNewest(a.p, b.p))
    .slice(0, limit)
    .map(({ p }) => p);
}

/** ~220 words per minute over all text blocks. */
export function readingMinutes(post: Post): number {
  const words = post.body
    .flatMap((b) => ("items" in b ? b.items : "title" in b ? [b.title, b.text] : [b.text]))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/* ─── Careers ─────────────────────────────────────────────────────────── */

export async function getJobs(): Promise<Job[]> {
  const list = (await fromDb<Job[]>("jobs", null, ["jobs"])) ?? localJobs;
  return list.filter((j) => j.open);
}

export async function getJob(slug: string): Promise<Job | null> {
  const remote = await fromDb<Job>("jobs", slug, ["jobs", `job:${slug}`]);
  return remote ?? localJobs.find((j) => j.slug === slug) ?? null;
}
