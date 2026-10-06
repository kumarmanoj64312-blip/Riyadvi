/**
 * Data-access layer — the ONLY place pages/components get content from.
 *
 *   CONTENT_SOURCE=local (default) → typed objects in src/data/*
 *   CONTENT_SOURCE=api             → Express backend (MongoDB), with the local
 *                                    data as a safety net if the API is down
 *
 * Swapping in Strapi / Sanity / WordPress later means changing `fromApi`
 * here — no component changes.
 *
 * "Add a service without rebuilding": with the API source, fetches are cached
 * for REVALIDATE seconds (ISR). A new DB record appears on the next
 * revalidation, and an unknown /services/[slug] is rendered on demand because
 * dynamic params are allowed (Next's default).
 */
import { services as localServices } from "@/data/services";
import { projects as localProjects } from "@/data/projects";
import { transformationStages as localStages } from "@/data/transformation";
import { technologies as localTechnologies } from "@/data/technologies";
import { company as localCompany, milestones as localMilestones } from "@/data/company";
import { posts as localPosts } from "@/data/posts";
import { jobs as localJobs } from "@/data/jobs";
import type { CompanyProfile, Job, Milestone, Post, Project, Service, Technology, TransformationStage } from "@/types/content";

const SOURCE = process.env.CONTENT_SOURCE === "api" ? "api" : "local";
const API_URL = process.env.BACKEND_URL;
const REVALIDATE = 60; // seconds

/**
 * GET {BACKEND_URL}/api{path} → `data` field of our standard response shape
 * ({ success, message, data }). Returns null on any failure so callers can
 * fall back to local content instead of breaking the page.
 */
async function fromApi<T>(path: string, tags: string[]): Promise<T | null> {
  if (SOURCE !== "api" || !API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      next: { revalidate: REVALIDATE, tags },
      signal: AbortSignal.timeout(5000), // a sleeping backend must not hang the page
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data?: T };
    return json.success && json.data ? json.data : null;
  } catch {
    return null;
  }
}

/* ─── Services ─────────────────────────────────────────────────────────── */

export async function getServices(): Promise<Service[]> {
  return (await fromApi<Service[]>("/services", ["services"])) ?? localServices;
}

export async function getService(slug: string): Promise<Service | null> {
  const remote = await fromApi<Service>(`/services/${encodeURIComponent(slug)}`, ["services", `service:${slug}`]);
  return remote ?? localServices.find((s) => s.slug === slug) ?? null;
}

/* ─── Portfolio ────────────────────────────────────────────────────────── */

export async function getProjects(): Promise<Project[]> {
  return (await fromApi<Project[]>("/projects", ["projects"])) ?? localProjects;
}

export async function getProject(slug: string): Promise<Project | null> {
  const remote = await fromApi<Project>(`/projects/${encodeURIComponent(slug)}`, ["projects", `project:${slug}`]);
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
  const list = (await fromApi<Post[]>("/posts", ["posts"])) ?? localPosts;
  return [...list].sort(byNewest);
}

export async function getPost(slug: string): Promise<Post | null> {
  const remote = await fromApi<Post>(`/posts/${encodeURIComponent(slug)}`, ["posts", `post:${slug}`]);
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
  const list = (await fromApi<Job[]>("/jobs", ["jobs"])) ?? localJobs;
  return list.filter((j) => j.open);
}

export async function getJob(slug: string): Promise<Job | null> {
  const remote = await fromApi<Job>(`/jobs/${encodeURIComponent(slug)}`, ["jobs", `job:${slug}`]);
  return remote ?? localJobs.find((j) => j.slug === slug) ?? null;
}
