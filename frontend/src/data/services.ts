import type { Service } from "@/types/content";

/**
 * Local service content — the fallback/seed source for the data-access layer
 * (lib/content.ts). `npm run seed` loads MongoDB from the same shape, so pages
 * render identically from either source.
 *
 * Adding a service = adding an object here (or a DB record). The template at
 * /services/[slug] renders it; `sceneType` picks an existing 3D visual.
 */
export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    tagline: "Fast, scalable websites and web apps",
    summary:
      "High-performance websites, portals and web applications built on modern frameworks — engineered to load fast, rank well and convert.",
    sceneType: "web-development",
    hero: {
      headline: "Websites and web apps engineered for growth",
      intro:
        "From corporate websites to complex web platforms, we build fast, secure and scalable products on Next.js, React and Node.js — designed around the outcomes your business needs.",
    },
    problem: {
      title: "Is your website holding your business back?",
      points: [
        "Slow pages that lose visitors before they convert",
        "An outdated design that undermines trust in your brand",
        "Content updates that need a developer every time",
        "No connection between the website and your sales or operations tools",
      ],
    },
    solution: {
      title: "A website that works as hard as your team",
      description:
        "We combine performance engineering, conversion-focused design and a manageable content architecture, so your site is fast on every device, easy to update and connected to the systems you already use.",
    },
    features: [
      { title: "Performance first", description: "Server rendering, image optimisation and code splitting for Core Web Vitals that pass." },
      { title: "SEO-ready architecture", description: "Semantic markup, structured data and clean URLs from day one." },
      { title: "Headless CMS", description: "Your team edits content in a friendly CMS; the site stays fast and secure." },
      { title: "Integrations", description: "CRMs, payment gateways, booking engines and ERPs connected through robust APIs." },
      { title: "Security & reliability", description: "Hardened hosting, automated backups and monitoring." },
      { title: "Analytics built in", description: "Event tracking and dashboards so every decision is measurable." },
    ],
    useCases: [
      { industry: "Healthcare", description: "Clinic websites with online appointment booking and patient information." },
      { industry: "Real estate", description: "Property listings with search, filters and lead capture." },
      { industry: "Retail & D2C", description: "E-commerce stores with fast checkout and inventory sync." },
      { industry: "B2B services", description: "Lead-generating corporate sites with gated resources and CRM sync." },
    ],
    techStack: ["Next.js", "React", "TypeScript", "Node.js", "Express", "MongoDB", "MySQL", "WordPress", "Tailwind CSS"],
    process: [
      { title: "Discover", description: "Goals, audience and content audit." },
      { title: "Architect", description: "Sitemap, data model and technical plan." },
      { title: "Design & build", description: "Iterative sprints with weekly demos." },
      { title: "Launch & grow", description: "QA, go-live, analytics and ongoing optimisation." },
    ],
    relatedProjects: ["wanaromah", "nugenica-biotech-lab", "sivam-physio-care"],
  },
  {
    slug: "app-development",
    title: "App Development",
    tagline: "Native-quality mobile apps for iOS & Android",
    summary:
      "Cross-platform and native mobile apps that customers love to use — from MVP to scale, with secure backends and smooth releases.",
    sceneType: "app-development",
    hero: {
      headline: "Mobile apps your customers keep coming back to",
      intro:
        "We design and build iOS and Android apps with intuitive UX, reliable performance and secure cloud backends — taking you from idea to App Store and beyond.",
    },
    problem: {
      title: "Great app ideas often stall in execution",
      points: [
        "Unclear scope that balloons time and budget",
        "Clunky experiences that drive users to uninstall",
        "Separate iOS and Android codebases that double the cost",
        "Backends that can't keep up as users grow",
      ],
    },
    solution: {
      title: "From MVP to scale, one accountable team",
      description:
        "We validate the core idea fast with a focused MVP, then grow it with a shared cross-platform codebase, a scalable API and release pipelines that keep updates flowing.",
    },
    features: [
      { title: "Cross-platform", description: "One React Native / Flutter codebase for iOS and Android." },
      { title: "Offline-ready", description: "Local storage and sync so the app works on patchy networks." },
      { title: "Secure backend", description: "Authentication, role-based access and encrypted data." },
      { title: "Push & engagement", description: "Notifications, deep links and in-app messaging." },
      { title: "Payments", description: "UPI, cards and wallets via trusted gateways." },
      { title: "Store launch", description: "App Store and Play Store submission handled end-to-end." },
    ],
    useCases: [
      { industry: "Healthcare", description: "Patient apps for records, reminders and teleconsultation." },
      { industry: "Astrology & wellness", description: "AI-assisted consultation and subscription apps." },
      { industry: "Services", description: "Booking, tracking and loyalty apps for salons and studios." },
      { industry: "Field operations", description: "Internal apps for sales teams and on-site staff." },
    ],
    techStack: ["React Native", "Flutter", "Swift", "Kotlin", "Node.js", "Firebase", "MongoDB", "AWS"],
    process: [
      { title: "Validate", description: "User journeys, feature priority and MVP scope." },
      { title: "Prototype", description: "Clickable prototype tested with real users." },
      { title: "Build", description: "Two-week sprints, TestFlight / beta builds every sprint." },
      { title: "Release & iterate", description: "Store launch, analytics and roadmap for v2." },
    ],
    relatedProjects: ["laxmi-astro-ai", "visdoc", "studio11"],
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    tagline: "Data-driven growth across search & social",
    summary:
      "SEO, performance marketing and social campaigns measured against real business numbers — leads, sales and customer lifetime value.",
    sceneType: "digital-marketing",
    hero: {
      headline: "Marketing measured in growth, not vanity metrics",
      intro:
        "We plan, run and optimise campaigns across search, social and content — with transparent reporting tied to the numbers that matter to your business.",
    },
    problem: {
      title: "Spending on marketing but unsure what's working?",
      points: [
        "Ad budgets spread thin with no clear return",
        "Low search visibility for the services you sell",
        "Social activity that doesn't turn into enquiries",
        "Reports full of impressions but no revenue story",
      ],
    },
    solution: {
      title: "One growth engine, fully measured",
      description:
        "We connect strategy, creative and analytics: every campaign has a target, every channel is tracked to leads and sales, and budget moves to what performs.",
    },
    features: [
      { title: "SEO", description: "Technical, on-page and local SEO that compounds over time." },
      { title: "Performance ads", description: "Google and Meta campaigns optimised for cost per lead." },
      { title: "Social media", description: "Content calendars and creative that build a community." },
      { title: "Content marketing", description: "Articles, guides and lead magnets that attract buyers." },
      { title: "Conversion optimisation", description: "Landing pages and A/B tests that lift conversion rates." },
      { title: "Analytics & reporting", description: "Dashboards that tie spend to revenue." },
    ],
    useCases: [
      { industry: "Local businesses", description: "Google Business Profile and local search dominance." },
      { industry: "D2C brands", description: "Full-funnel paid social with retargeting." },
      { industry: "Healthcare", description: "Compliant campaigns that grow appointment bookings." },
      { industry: "B2B", description: "Lead generation with gated content and nurturing." },
    ],
    techStack: ["Google Ads", "Meta Ads", "Google Analytics 4", "Search Console", "Semrush", "HubSpot", "Looker Studio"],
    process: [
      { title: "Audit", description: "Channels, competitors and tracking health." },
      { title: "Plan", description: "Targets, budget split and creative strategy." },
      { title: "Launch", description: "Campaigns live with conversion tracking." },
      { title: "Optimise", description: "Weekly tuning and monthly growth reviews." },
    ],
    relatedProjects: ["tony-and-guy", "studio11", "puratap"],
  },
  {
    slug: "ar-vr",
    title: "AR / VR",
    tagline: "Immersive experiences that sell and train",
    summary:
      "Augmented and virtual reality experiences — virtual tours, product try-ons and training simulations that make complex things tangible.",
    sceneType: "ar-vr",
    hero: {
      headline: "Step inside the experience",
      intro:
        "We create web-based and headset AR/VR experiences that let customers explore properties, try products and learn by doing — no imagination required.",
    },
    problem: {
      title: "Some things are hard to sell with photos",
      points: [
        "Buyers can't visualise spaces or products before purchase",
        "Physical demos and site visits are costly and slow",
        "Training on real equipment is expensive and risky",
        "Static brochures fail to stand out",
      ],
    },
    solution: {
      title: "Immersive, accessible, measurable",
      description:
        "We build experiences that run in the browser or on headsets — optimised 3D, intuitive interactions and analytics on how people engage.",
    },
    features: [
      { title: "Virtual tours", description: "Walk-throughs of properties, showrooms and facilities." },
      { title: "WebAR", description: "Place products in your room straight from the browser — no app needed." },
      { title: "VR training", description: "Safe, repeatable simulations for complex procedures." },
      { title: "3D configurators", description: "Customise colours, materials and options in real time." },
      { title: "Cross-device", description: "Works on phones, desktops and Meta Quest." },
      { title: "Engagement analytics", description: "See what users explore and where they convert." },
    ],
    useCases: [
      { industry: "Real estate", description: "Pre-launch virtual site visits and interior previews." },
      { industry: "Retail", description: "Try-before-you-buy for furniture, decor and fashion." },
      { industry: "Education", description: "Interactive labs and immersive lessons." },
      { industry: "Manufacturing", description: "Equipment training and maintenance guidance." },
    ],
    techStack: ["Three.js", "React Three Fiber", "WebXR", "Unity", "Blender", "8th Wall"],
    process: [
      { title: "Concept", description: "Experience goals, platforms and storyboard." },
      { title: "3D production", description: "Modelling, texturing and optimisation." },
      { title: "Interaction", description: "Development and usability testing." },
      { title: "Deploy", description: "Web or store release with analytics." },
    ],
    relatedProjects: ["pearl-housing"],
  },
  {
    slug: "3d-modeling",
    title: "3D Modeling",
    tagline: "Photoreal models, renders and real-time assets",
    summary:
      "Detailed 3D models, product renders and optimised real-time assets for web, AR/VR, marketing and manufacturing.",
    sceneType: "3d-modeling",
    hero: {
      headline: "Ideas, modelled in three dimensions",
      intro:
        "From photoreal product renders to lightweight assets for the web and AR, we model, texture and optimise 3D content that looks stunning and performs.",
    },
    problem: {
      title: "Physical photoshoots and prototypes are slow",
      points: [
        "Product photography for every variant is expensive",
        "Prototypes take weeks to iterate",
        "Heavy 3D files are unusable on the web",
        "Inconsistent visuals across channels",
      ],
    },
    solution: {
      title: "One model, every channel",
      description:
        "A single accurate model becomes renders, animations, web viewers and AR — optimised for each use so it looks great and loads fast.",
    },
    features: [
      { title: "Product modelling", description: "Accurate, production-ready models from drawings or references." },
      { title: "Photoreal rendering", description: "Studio-quality stills and turntables." },
      { title: "Architectural visualisation", description: "Interiors and exteriors before they're built." },
      { title: "Web-optimised assets", description: "Draco-compressed glTF under a few MB." },
      { title: "Animation", description: "Exploded views and assembly sequences." },
      { title: "Texturing & materials", description: "PBR materials that look right in any engine." },
    ],
    useCases: [
      { industry: "E-commerce", description: "360° product viewers that reduce returns." },
      { industry: "Real estate", description: "Pre-construction renders and walkthroughs." },
      { industry: "Manufacturing", description: "Technical visualisation and assembly guides." },
      { industry: "Healthcare", description: "Anatomical and device models for education." },
    ],
    techStack: ["Blender", "Substance Painter", "glTF / Draco", "Three.js", "KeyShot"],
    process: [
      { title: "Reference", description: "Drawings, photos and dimensions." },
      { title: "Model", description: "Topology and detailing with review rounds." },
      { title: "Materials", description: "Texturing and lighting." },
      { title: "Deliver", description: "Renders, animations and optimised real-time files." },
    ],
    relatedProjects: ["pearl-housing", "cube-dental"],
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    tagline: "Research-led design that converts",
    summary:
      "User research, UX strategy and polished interface design — design systems that make products intuitive, consistent and on-brand.",
    sceneType: "ui-ux-design",
    hero: {
      headline: "Design that makes complex things feel simple",
      intro:
        "We research how your users think, then design interfaces and design systems that make every journey intuitive — validated with real people before development.",
    },
    problem: {
      title: "Users don't read manuals — they leave",
      points: [
        "Confusing navigation and dead-end journeys",
        "Inconsistent screens that feel stitched together",
        "Low conversion on key flows like sign-up and checkout",
        "Design and development constantly out of sync",
      ],
    },
    solution: {
      title: "Evidence over opinion",
      description:
        "Research, wireframes, prototypes and testing — then a scalable design system your developers can build from directly.",
    },
    features: [
      { title: "User research", description: "Interviews, analytics and competitor reviews." },
      { title: "Information architecture", description: "Structures and flows that match mental models." },
      { title: "Wireframes & prototypes", description: "Fast, testable ideas before visual polish." },
      { title: "Visual design", description: "Premium, on-brand interfaces." },
      { title: "Design systems", description: "Reusable components and tokens in Figma and code." },
      { title: "Usability testing", description: "Validate with real users and iterate." },
    ],
    useCases: [
      { industry: "SaaS", description: "Onboarding and dashboard redesigns that reduce churn." },
      { industry: "Healthcare", description: "Accessible patient and practitioner interfaces." },
      { industry: "E-commerce", description: "Product discovery and checkout optimisation." },
      { industry: "Enterprise", description: "Internal tools that teams actually enjoy." },
    ],
    techStack: ["Figma", "FigJam", "Maze", "Hotjar", "Storybook", "Tailwind CSS"],
    process: [
      { title: "Research", description: "Understand users and business goals." },
      { title: "Define", description: "Journeys, IA and success metrics." },
      { title: "Design", description: "Wireframes → prototypes → hi-fi UI." },
      { title: "Validate & hand off", description: "Testing, design system and dev handoff." },
    ],
    relatedProjects: ["cube-dental", "visdoc", "wanaromah"],
  },
];
