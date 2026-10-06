import type { Technology } from "@/types/content";

/** Technology ecosystem — drives the 3D constellation and its accessible list. */
export const technologies: Technology[] = [
  // Ring 0 — the experience layer
  { slug: "react", name: "React", category: "Frontend", ring: 0, color: "#61dafb", usage: "Component-driven interfaces for every web product we build." },
  { slug: "nextjs", name: "Next.js", category: "Frontend", ring: 0, color: "#ffffff", usage: "Fast, SEO-friendly websites and web apps — including this one." },
  { slug: "javascript", name: "JavaScript", category: "Frontend", ring: 0, color: "#f7df1e", usage: "The language of the web, end to end." },
  { slug: "typescript", name: "TypeScript", category: "Frontend", ring: 0, color: "#3178c6", usage: "Type-safe code that scales with larger teams." },
  { slug: "threejs", name: "Three.js", category: "3D & Immersive", ring: 0, color: "#d4af37", usage: "Real-time 3D in the browser — product viewers and immersive sites." },
  { slug: "r3f", name: "React Three Fiber", category: "3D & Immersive", ring: 0, color: "#f5e27a", usage: "3D scenes as React components (this site's hero, story and services)." },
  // Ring 1 — the engine
  { slug: "nodejs", name: "Node.js", category: "Backend", ring: 1, color: "#5fa04e", usage: "APIs, integrations and real-time services." },
  { slug: "express", name: "Express", category: "Backend", ring: 1, color: "#d4d4d4", usage: "Lean, well-structured REST APIs." },
  { slug: "mongodb", name: "MongoDB", category: "Database", ring: 1, color: "#47a248", usage: "Flexible document data for fast-moving products." },
  { slug: "mysql", name: "MySQL", category: "Database", ring: 1, color: "#4479a1", usage: "Relational data for transactional systems." },
  { slug: "firebase", name: "Firebase", category: "Backend", ring: 1, color: "#ffca28", usage: "Auth, push notifications and real-time sync for apps." },
  // Ring 2 — reach & delivery
  { slug: "react-native", name: "React Native", category: "Mobile", ring: 2, color: "#61dafb", usage: "One codebase for iOS and Android apps." },
  { slug: "flutter", name: "Flutter", category: "Mobile", ring: 2, color: "#02569b", usage: "Pixel-perfect cross-platform mobile apps." },
  { slug: "wordpress", name: "WordPress", category: "CMS & Cloud", ring: 2, color: "#21759b", usage: "Content-managed marketing sites teams can edit themselves." },
  { slug: "aws", name: "AWS", category: "CMS & Cloud", ring: 2, color: "#ff9900", usage: "Scalable, secure cloud hosting and storage." },
  { slug: "blender", name: "Blender", category: "3D & Immersive", ring: 2, color: "#e87d0d", usage: "3D modelling, rendering and optimised web assets." },
  { slug: "figma", name: "Figma", category: "CMS & Cloud", ring: 2, color: "#a259ff", usage: "Design systems and prototypes shared with clients in real time." },
];
