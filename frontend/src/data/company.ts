import type { CompanyProfile, Milestone } from "@/types/content";

/**
 * Company profile for /about and the home "Why Riyadvi" section.
 *
 * ⚠️ "Founded in 2021" is fact. The milestones below are SAMPLE content
 * aligned with the portfolio data — confirm or edit them with Riyadvi before
 * launch. `recognition` is intentionally empty: add only real awards or
 * certifications (the section stays hidden until it has entries).
 */
export const company: CompanyProfile = {
  story: [
    "Riyadvi Software Technologies started in 2021 with a simple belief: technology should be judged by the business results it creates, not by how impressive it looks in a demo.",
    "We began by building websites for local businesses that had outgrown their first online presence. Clients kept coming back with bigger questions — how to generate more leads, automate manual work, launch an app — and we grew with them.",
    "Today we work as a technology and digital solutions partner: strategy, design, engineering, 3D and marketing under one roof, with one team accountable for the outcome.",
  ],
  vision: "To be the technology partner growing businesses trust to turn ambition into measurable digital growth.",
  mission:
    "We combine business understanding, design excellence and modern engineering to build digital products that solve real problems — and we stay to make them better.",
  values: [
    { title: "Outcomes over output", description: "We measure success in leads, sales and hours saved — not in features shipped." },
    { title: "Radical clarity", description: "Plain-language plans, transparent pricing and weekly demos. No surprises." },
    { title: "Craft in every pixel", description: "Premium design and clean code are how we respect our clients' customers." },
    { title: "Partners for the long run", description: "Launch is the beginning. We optimise, support and grow alongside you." },
  ],
  recognition: [],
};

export const milestones: Milestone[] = [
  { year: 2021, title: "Riyadvi is founded", description: "Started with web development for local healthcare and service businesses." },
  { year: 2022, title: "Growth marketing joins the toolkit", description: "Added SEO and performance marketing so websites didn't just look good — they brought in customers." },
  { year: 2023, title: "From websites to products", description: "Delivered e-commerce, loyalty apps and life-science platforms; UI/UX became a dedicated practice." },
  { year: 2024, title: "AI, AR/VR and 3D", description: "Launched AI-assisted apps and immersive 3D experiences, including pre-launch virtual tours for real estate." },
  { year: 2025, title: "A full digital partner", description: "Strategy, design, engineering, 3D and marketing under one accountable team." },
];
