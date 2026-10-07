import type { Project } from "@/types/content";

/**
 * Portfolio case studies (local source for lib/content.ts; `npm run seed` loads
 * MongoDB from the same shape).
 *
 * ⚠️ SAMPLE CONTENT: client names come from Riyadvi's portfolio; the
 * narrative is written from each client's business type, and the `results`
 * figures are ILLUSTRATIVE placeholders — replace with real, approved numbers
 * before going live.
 *
 * No testimonials are included on purpose: quotes must be real and approved
 * by the client (the `testimonial` field is ready for them).
 *
 * Visuals are generated from `accent` + `screens` (CSS mockups and 3D screen
 * textures) until real screenshots are added.
 */
export const projects: Project[] = [
  {
    slug: "puratap",
    client: "Puratap",
    title: "A clearer path from search to installation",
    industry: "Home Services",
    year: 2023,
    services: ["web-development", "digital-marketing"],
    summary: "A conversion-focused website and local SEO programme for a water filtration specialist.",
    challenge:
      "Customers compared filtration systems across many sites and abandoned before booking. Product information was scattered and the booking flow required a phone call.",
    solution:
      "We rebuilt the site around a guided product finder, clear comparisons and an online installation booking flow, backed by location pages for local search.",
    deliverables: ["Product finder", "Online booking flow", "Location landing pages", "Local SEO setup"],
    technologies: ["Next.js", "Node.js", "MongoDB", "Google Analytics 4"],
    results: [
      { value: "+48%", label: "Online booking requests" },
      { value: "2.1s", label: "Average page load" },
      { value: "Top 3", label: "Local search rankings" },
    ],
    accent: "#38bdf8",
    screens: [
      { label: "Product finder", kind: "desktop" },
      { label: "Compare systems", kind: "desktop" },
      { label: "Book installation", kind: "mobile" },
    ],
  },
  {
    slug: "wanaromah",
    client: "Wanaromah Perfumers",
    title: "A luxury fragrance house, online",
    industry: "E-commerce & Retail",
    year: 2023,
    services: ["web-development", "ui-ux-design"],
    summary: "A premium D2C storefront that translates the in-store fragrance experience to the web.",
    challenge:
      "Fragrance is hard to sell online — customers can't smell it. The brand needed a store that communicates scent and craftsmanship and still checks out fast.",
    solution:
      "We designed scent-family navigation, rich notes pyramids and gift bundles, on a fast headless storefront with a streamlined checkout.",
    deliverables: ["Brand-led UI design", "Scent finder", "Headless storefront", "Gift bundles & checkout"],
    technologies: ["Next.js", "React", "Tailwind CSS", "Razorpay", "Node.js"],
    results: [
      { value: "+62%", label: "Online revenue" },
      { value: "+35%", label: "Average order value" },
      { value: "−28%", label: "Checkout drop-off" },
    ],
    accent: "#c084fc",
    screens: [
      { label: "Collection", kind: "desktop" },
      { label: "Notes pyramid", kind: "desktop" },
      { label: "Checkout", kind: "desktop" },
    ],
    showcase: { device: "laptop" },
    featured: true,
  },
  {
    slug: "laxmi-astro-ai",
    client: "Laxmi Astro AI",
    title: "Astrology consultations, powered by AI",
    industry: "Astrology & Lifestyle",
    year: 2024,
    services: ["app-development", "ui-ux-design"],
    summary: "A mobile app that pairs AI-generated birth-chart insights with live astrologer consultations.",
    challenge:
      "Consultations were booked over WhatsApp and paid manually. The client wanted instant, personalised insights at scale without losing the human astrologer.",
    solution:
      "We built a cross-platform app with AI-assisted chart readings, astrologer chat and calls, wallet-based payments and a subscription tier.",
    deliverables: ["Cross-platform app", "AI chart insights", "Astrologer chat & calls", "Wallet & subscriptions"],
    technologies: ["React Native", "Node.js", "MongoDB", "OpenAI API", "Firebase"],
    results: [
      { value: "50k+", label: "App installs" },
      { value: "4.6★", label: "Store rating" },
      { value: "3×", label: "Consultations per astrologer" },
    ],
    accent: "#f59e0b",
    screens: [
      { label: "Daily horoscope", kind: "mobile" },
      { label: "AI birth chart", kind: "mobile" },
      { label: "Talk to astrologer", kind: "mobile" },
    ],
    showcase: { device: "phone" },
    featured: true,
  },
  {
    slug: "tony-and-guy",
    client: "Tony & Guy",
    title: "Filling salon chairs with local search",
    industry: "Beauty & Wellness",
    year: 2022,
    services: ["digital-marketing", "web-development"],
    summary: "A booking-first website and performance marketing for a premium salon brand.",
    challenge:
      "Most appointments came by phone during busy hours, and paid social generated likes rather than bookings.",
    solution:
      "We launched a booking-first site with stylist profiles and service menus, then rebuilt campaigns around booking conversions with retargeting.",
    deliverables: ["Online booking site", "Stylist profiles", "Meta & Google campaigns", "Conversion tracking"],
    technologies: ["WordPress", "Google Ads", "Meta Ads", "Google Analytics 4"],
    results: [
      { value: "+70%", label: "Online bookings" },
      { value: "−32%", label: "Cost per booking" },
      { value: "4.8★", label: "Google rating" },
    ],
    accent: "#f472b6",
    screens: [
      { label: "Services menu", kind: "desktop" },
      { label: "Book a stylist", kind: "mobile" },
    ],
  },
  {
    slug: "studio11",
    client: "Studio11",
    title: "Loyalty that brings clients back",
    industry: "Beauty & Wellness",
    year: 2023,
    services: ["app-development", "digital-marketing"],
    summary: "A booking and loyalty app for a multi-location salon chain.",
    challenge:
      "Clients visited once and didn't return; each branch ran its own promotions with no shared customer data.",
    solution:
      "A single app for booking across branches, a points-based loyalty programme and automated win-back campaigns.",
    deliverables: ["Booking & loyalty app", "Branch admin panel", "Push campaigns", "CRM integration"],
    technologies: ["Flutter", "Node.js", "MySQL", "Firebase Cloud Messaging"],
    results: [
      { value: "+41%", label: "Repeat visits" },
      { value: "18k", label: "Loyalty members" },
      { value: "6", label: "Branches unified" },
    ],
    accent: "#fb7185",
    screens: [
      { label: "Book a slot", kind: "mobile" },
      { label: "Rewards", kind: "mobile" },
    ],
  },
  {
    slug: "sivam-physio-care",
    client: "Sivam Physio Care",
    title: "A clinic website patients actually use",
    industry: "Healthcare",
    year: 2022,
    services: ["web-development", "digital-marketing"],
    summary: "An accessible clinic website with treatment guides and online appointments.",
    challenge:
      "Patients searched for symptoms, not treatment names, and the old site offered no way to book outside opening hours.",
    solution:
      "Symptom-led content architecture, treatment explainers, practitioner profiles and 24/7 appointment requests — plus local SEO.",
    deliverables: ["Accessible clinic site", "Symptom guides", "Appointment requests", "Local SEO"],
    technologies: ["Next.js", "Tailwind CSS", "Node.js", "Google Business Profile"],
    results: [
      { value: "+85%", label: "Organic visits" },
      { value: "+55%", label: "Appointment requests" },
      { value: "AA", label: "Accessibility level" },
    ],
    accent: "#34d399",
    screens: [
      { label: "Treatments", kind: "desktop" },
      { label: "Book appointment", kind: "mobile" },
    ],
  },
  {
    slug: "pearl-housing",
    client: "Pearl Housing",
    title: "Selling homes before they're built",
    industry: "Real Estate",
    year: 2024,
    services: ["ar-vr", "3d-modeling", "web-development"],
    summary: "3D walkthroughs and a project website that let buyers tour apartments before construction.",
    challenge:
      "Pre-launch buyers had only floor plans and brochures; site visits were impossible and sales cycles were long.",
    solution:
      "Photoreal 3D models of every unit type, an in-browser virtual tour and a project site with live availability and enquiry capture.",
    deliverables: ["Unit 3D models", "Browser virtual tour", "Availability map", "Lead capture & CRM"],
    technologies: ["Blender", "Three.js", "React Three Fiber", "Next.js", "MongoDB"],
    results: [
      { value: "+3.4×", label: "Qualified enquiries" },
      { value: "40%", label: "Units booked pre-launch" },
      { value: "6 min", label: "Avg. tour time" },
    ],
    accent: "#e5c76b",
    screens: [
      { label: "Virtual tour", kind: "desktop" },
      { label: "Unit availability", kind: "desktop" },
    ],
    showcase: { device: "laptop" },
    featured: true,
  },
  {
    slug: "nugenica-biotech-lab",
    client: "Nugenica Biotech Lab",
    title: "Making complex science approachable",
    industry: "Life Sciences",
    year: 2023,
    services: ["web-development", "ui-ux-design"],
    summary: "A credible, research-forward website for a biotechnology laboratory.",
    challenge:
      "Highly technical services had to be understood by procurement teams and researchers alike, and partnership enquiries were being lost in a generic inbox.",
    solution:
      "Clear service taxonomy, plain-language explainers alongside technical specs, and routed enquiry forms for each lab service.",
    deliverables: ["Information architecture", "Service catalogue", "Routed enquiry forms", "CMS for publications"],
    technologies: ["Next.js", "Headless CMS", "Node.js", "Tailwind CSS"],
    results: [
      { value: "+60%", label: "Partnership enquiries" },
      { value: "−45%", label: "Bounce rate" },
      { value: "100%", label: "Content managed in-house" },
    ],
    accent: "#22d3ee",
    screens: [
      { label: "Lab services", kind: "desktop" },
      { label: "Publications", kind: "desktop" },
    ],
  },
  {
    slug: "visdoc",
    client: "VisDoc",
    title: "Doctor consultations without the waiting room",
    industry: "Healthcare",
    year: 2024,
    services: ["app-development", "ui-ux-design"],
    summary: "A telemedicine app with video consultations, e-prescriptions and health records.",
    challenge:
      "Patients in smaller towns travelled hours for routine follow-ups, and doctors had no unified view of patient history.",
    solution:
      "A patient app and doctor dashboard with scheduling, secure video calls, e-prescriptions and a shared medical record.",
    deliverables: ["Patient app", "Doctor dashboard", "Secure video consults", "E-prescriptions"],
    technologies: ["React Native", "WebRTC", "Node.js", "MongoDB", "AWS"],
    results: [
      { value: "12k+", label: "Consultations" },
      { value: "−70%", label: "Patient travel time" },
      { value: "4.7★", label: "App rating" },
    ],
    accent: "#60a5fa",
    screens: [
      { label: "Find a doctor", kind: "mobile" },
      { label: "Video consult", kind: "mobile" },
      { label: "Prescriptions", kind: "mobile" },
    ],
    showcase: { device: "phone" },
  },
  {
    slug: "cube-dental",
    client: "Cube Dental",
    title: "Calm, clear dental care online",
    industry: "Healthcare",
    year: 2023,
    services: ["ui-ux-design", "web-development", "3d-modeling"],
    summary: "A reassuring patient experience with 3D treatment explainers for a dental clinic.",
    challenge:
      "Anxious patients delayed treatment because procedures were hard to understand, and the clinic's site felt clinical and dated.",
    solution:
      "A warm, accessible redesign with 3D-rendered treatment explainers, transparent pricing and simple online booking.",
    deliverables: ["UX research & redesign", "3D treatment explainers", "Pricing pages", "Online booking"],
    technologies: ["Figma", "Blender", "Next.js", "Tailwind CSS"],
    results: [
      { value: "+52%", label: "New patient bookings" },
      { value: "+2m", label: "Avg. time on treatment pages" },
      { value: "4.9★", label: "Patient reviews" },
    ],
    accent: "#2dd4bf",
    screens: [
      { label: "Treatments in 3D", kind: "desktop" },
      { label: "Book a visit", kind: "mobile" },
    ],
  },
];
