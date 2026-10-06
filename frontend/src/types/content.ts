/**
 * Content types shared by data files, the data-access layer and templates.
 * (Service, Project, Post, Job, Technology… are added as their steps land.)
 */

/**
 * Which 3D visual a service uses. Decoupled from the slug on purpose: a new
 * service added from the CMS/DB can reuse any existing scene (or "generic")
 * without shipping new 3D code.
 */
export type ServiceSceneType =
  | "web-development"
  | "app-development"
  | "digital-marketing"
  | "ar-vr"
  | "3d-modeling"
  | "ui-ux-design"
  | "generic";

export type TitledText = { title: string; description: string };

/** A service offering — drives the home tile, /services and /services/[slug]. */
export type Service = {
  slug: string;
  title: string;
  /** One-liner under the title on cards. */
  tagline: string;
  /** 1–2 sentence card / meta description. */
  summary: string;
  sceneType: ServiceSceneType;
  hero: { headline: string; intro: string };
  problem: { title: string; points: string[] };
  solution: { title: string; description: string };
  features: TitledText[];
  useCases: { industry: string; description: string }[];
  techStack: string[];
  process: TitledText[];
  /** Slugs of portfolio projects to show as related work. */
  relatedProjects: string[];
};

/** A screen of a project, shown in mock visuals and on the 3D device. */
export type ProjectScreen = { label: string; kind: "desktop" | "mobile" };

/** Portfolio case study — drives /portfolio cards and /portfolio/[slug]. */
export type Project = {
  slug: string;
  client: string;
  /** Outcome-led headline for the case study. */
  title: string;
  industry: string;
  year: number;
  /** Slugs of services delivered (links to /services/[slug]). */
  services: string[];
  summary: string;
  challenge: string;
  solution: string;
  /** What we actually built/did — shown as a checklist. */
  deliverables: string[];
  technologies: string[];
  results: { value: string; label: string }[];
  testimonial?: { quote: string; author: string; role: string };
  /** Brand accent used by the generated visuals (until real screenshots exist). */
  accent: string;
  screens: ProjectScreen[];
  /** Interactive 3D device presentation on the case study page. */
  showcase?: { device: "phone" | "laptop" };
  featured?: boolean;
};

/** One step of the "Business Challenge → Growth" transformation story. */
export type TransformationStage = {
  id: string;
  /** Short label for the progress rail, e.g. "Strategy". */
  label: string;
  title: string;
  description: string;
  /** 2–3 concrete outputs of this stage, shown as chips. */
  deliverables: string[];
};

/** A technology in the ecosystem constellation. */
export type Technology = {
  slug: string;
  name: string;
  category: "Frontend" | "Backend" | "Database" | "3D & Immersive" | "Mobile" | "CMS & Cloud";
  /** Orbit ring in the 3D constellation (0 = inner). */
  ring: 0 | 1 | 2;
  /** Brand colour for the label dot. */
  color: string;
  /** One line on how Riyadvi uses it (tooltip). */
  usage: string;
};

/** A point on the "Since 2021" company timeline. */
export type Milestone = { year: number; title: string; description: string };

/** About-page company profile. */
export type CompanyProfile = {
  story: string[];
  vision: string;
  mission: string;
  values: TitledText[];
  /** Real awards / certifications only — the section is hidden while empty. */
  recognition: { title: string; issuer: string; year: number }[];
};

/**
 * Blog body as structured blocks (like Sanity's Portable Text or Strapi's
 * blocks) instead of raw HTML: any CMS can map onto it, and rendering it is
 * XSS-safe by construction.
 */
export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; title: string; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: { name: string; role: string };
  /** ISO date (YYYY-MM-DD). */
  publishedAt: string;
  /** Accent for the generated cover art. */
  accent: string;
  featured?: boolean;
  body: PostBlock[];
};

export type Job = {
  slug: string;
  /** Designation, e.g. "Frontend Developer". */
  title: string;
  department: "Engineering" | "Design" | "Marketing" | "Delivery";
  /** Years of experience required. */
  experience: { min: number; max: number };
  location: string;
  type: "Full-time" | "Internship" | "Contract";
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  postedAt: string;
  open: boolean;
};
