import type { Job } from "@/types/content";

/**
 * Open roles (local source for lib/content.ts; seeded into MongoDB so the
 * applications API can verify the role exists and is open).
 * Sample listings — edit to match real openings.
 */
export const jobs: Job[] = [
  {
    slug: "frontend-developer-react",
    title: "Frontend Developer (React / Next.js)",
    department: "Engineering",
    experience: { min: 1, max: 3 },
    location: "Hybrid · India",
    type: "Full-time",
    summary: "Build fast, accessible, beautiful interfaces for client websites and web apps — including interactive 3D experiences.",
    responsibilities: [
      "Build pages and components in Next.js, React and TypeScript",
      "Turn Figma designs into pixel-perfect, responsive UI",
      "Optimise Core Web Vitals and accessibility",
      "Collaborate with designers and backend developers in two-week sprints",
    ],
    requirements: [
      "1–3 years building production React applications",
      "Strong HTML, CSS (Tailwind is a plus) and modern JavaScript",
      "Understanding of responsive design and accessibility basics",
      "Comfortable with Git and code reviews",
    ],
    niceToHave: ["Three.js / React Three Fiber", "GSAP or Motion animations", "Experience with a headless CMS"],
    postedAt: "2026-09-20",
    open: true,
  },
  {
    slug: "backend-developer-node",
    title: "Backend Developer (Node.js)",
    department: "Engineering",
    experience: { min: 2, max: 5 },
    location: "Hybrid · India",
    type: "Full-time",
    summary: "Design and build the APIs, integrations and data models behind our clients' products.",
    responsibilities: [
      "Build secure REST APIs with Node.js and Express",
      "Model data in MongoDB and MySQL",
      "Integrate payments, CRMs and third-party services",
      "Own deployments, monitoring and performance",
    ],
    requirements: [
      "2–5 years of Node.js in production",
      "Solid understanding of REST, authentication and security basics",
      "Experience with MongoDB or SQL databases",
      "Clear written communication",
    ],
    niceToHave: ["AWS or similar cloud", "Testing with Jest / Vitest", "Experience mentoring juniors"],
    postedAt: "2026-09-10",
    open: true,
  },
  {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    department: "Design",
    experience: { min: 2, max: 4 },
    location: "Hybrid · India",
    type: "Full-time",
    summary: "Research, design and test experiences that make complex workflows feel effortless.",
    responsibilities: [
      "Run user research and translate insights into flows and wireframes",
      "Design premium, on-brand interfaces in Figma",
      "Build and maintain design systems",
      "Partner with developers through handoff and QA",
    ],
    requirements: [
      "2–4 years of product or agency design experience",
      "A portfolio showing process, not just final screens",
      "Strong Figma and prototyping skills",
      "Understanding of accessibility and responsive design",
    ],
    niceToHave: ["Motion design", "Basic HTML/CSS", "3D or Blender experience"],
    postedAt: "2026-08-28",
    open: true,
  },
  {
    slug: "digital-marketing-intern",
    title: "Digital Marketing Intern",
    department: "Marketing",
    experience: { min: 0, max: 1 },
    location: "On-site · India",
    type: "Internship",
    summary: "Learn performance marketing and SEO on real client campaigns, with mentoring from our growth team.",
    responsibilities: [
      "Support SEO audits and content planning",
      "Help set up and report on Google and Meta campaigns",
      "Create social media content calendars",
      "Track results in GA4 and Looker Studio",
    ],
    requirements: ["Curious, analytical and comfortable with numbers", "Good written English", "Basic understanding of social media platforms"],
    niceToHave: ["Google Ads or GA4 certification", "Canva or design basics"],
    postedAt: "2026-09-25",
    open: true,
  },
];
