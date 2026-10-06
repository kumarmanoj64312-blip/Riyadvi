import type { TransformationStage } from "@/types/content";

/**
 * Riyadvi's delivery approach, told as six stages. Order matters: stage i is
 * paired with 3D formation i in three/utils/morphLayouts.ts.
 */
export const transformationStages: TransformationStage[] = [
  {
    id: "challenge",
    label: "Challenge",
    title: "It starts with your business — not our tech stack",
    description:
      "We map the bottlenecks, scattered tools and missed opportunities that hold growth back, so every decision that follows is grounded in real business outcomes.",
    deliverables: ["Discovery workshop", "Pain-point audit", "Success metrics"],
  },
  {
    id: "strategy",
    label: "Strategy",
    title: "A clear roadmap, not a wish list",
    description:
      "Findings become a prioritised plan — scope, milestones, budget and measurable goals — so every rupee you invest has a reason behind it.",
    deliverables: ["Product roadmap", "Scope & estimates", "KPI framework"],
  },
  {
    id: "design",
    label: "Design",
    title: "Structure that feels effortless",
    description:
      "UX research, wireframes and high-fidelity UI turn complex workflows into experiences your customers and teams actually enjoy — validated before a line of code.",
    deliverables: ["User flows", "Wireframes", "UI design system"],
  },
  {
    id: "technology",
    label: "Technology",
    title: "Engineered to connect and scale",
    description:
      "Modern, scalable architecture — web, mobile and cloud — integrated with the systems you already run, built with React, Next.js, Node.js and more.",
    deliverables: ["System architecture", "Web & mobile apps", "API integrations"],
  },
  {
    id: "launch",
    label: "Launch",
    title: "A confident go-live",
    description:
      "Rigorous QA, performance tuning and a smooth rollout, with training and documentation so your team owns the product from day one.",
    deliverables: ["QA & performance", "Deployment", "Team onboarding"],
  },
  {
    id: "growth",
    label: "Growth",
    title: "Results that compound",
    description:
      "After launch we measure, optimise and market — SEO, analytics and continuous improvement that keep the numbers moving in the right direction.",
    deliverables: ["Analytics & SEO", "Optimisation sprints", "Long-term partnership"],
  },
];
