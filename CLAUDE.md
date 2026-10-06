# CLAUDE.md — Riyadvi Software Technologies Website Revamp

You are a senior full-stack + creative (3D/animation) developer pair-programming with me.
This is an **interview assignment**. The goal is NOT "generate a website with AI". The goal is to
use AI effectively while I **understand, control, debug and improve** every part. So:

- Write clean, commented, understandable code.
- After each meaningful step, give me a **short explanation of how it works and why** (so I can defend it in a 10-15 min walkthrough).
- Work in **small steps**. After each step, give me a **conventional commit message**.
- Never dump the whole project at once. Ask before making large architectural changes.
- Keep a running log in `/docs/AI_LOG.md` (see "AI Usage Log" below).

---

## 1. Project Overview

Revamp the corporate website of **Riyadvi Software Technologies** (reference: www.riyadvisoftwaretechnologies.com, founded **2021**).

Positioning: **"A Technology & Digital Solutions Partner – not simply a software development vendor."**
Communicate: technology expertise, innovation, business understanding, digital transformation, design excellence, long-term partnership, business growth.

Design direction: **Premium + Futuristic + Interactive + 3D + Professional.** Avoid a generic corporate look.

**This is NOT a landing page.** It is a multi-page, dynamic, production-style website with routing, reusable templates, backend APIs, a database, working forms, lead management and an admin dashboard.

Conversion goals: Book a consultation, Contact, Request a quote, Download lead magnet, Submit Business Health Checkup, Explore services, View portfolio.

---

## 2. Priority Order (if time runs short)

1. Homepage
2. 3D Hero
3. Services + dynamic service architecture
4. Portfolio + dynamic case study architecture
5. Lead-generation functionality
6. Backend + database
7. Responsive experience
8. Additional pages (Blog, Careers, About polish)

Time budget: 3-5 days. Quality and decision-making over quantity. Blog/Careers can have limited sample content but the **architecture must scale**.

**Evaluation weights:** 3D & Interactive 30% · AI-assisted dev 15% · UI/UX 15% · Frontend architecture 10% · Backend & DB 10% · Performance & responsiveness 10% · Git/docs/deploy 10%.
=> 3D quality and my ability to explain it matter most.

---

## 3. Tech Stack

**Frontend (`/frontend`)**
- Next.js (App Router) + TypeScript
- TailwindCSS
- React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`) + Three.js
- GSAP + ScrollTrigger
- Lenis (smooth scrolling)
- Motion (`motion` / framer-motion) for UI micro-interactions
- react-hook-form + zod for forms/validation
- Optional: `detect-gpu` for device capability tiering

(That is 6 animation/3D technologies: Three.js, R3F, Drei, GSAP, ScrollTrigger, Lenis, Motion. Each MUST visibly contribute. Installing a library is not implementation.)

**Backend (`/backend`)**
- Node.js + Express
- MongoDB + Mongoose
- zod or express-validator for validation
- helmet, cors, express-rate-limit
- nodemailer for email notifications
- multer (or cloud storage) for resume upload
- JWT (or simple env-based admin auth) for the admin dashboard
- dotenv for all secrets

**Deployment**
- Frontend: Vercel
- Backend: Render or Railway
- DB: MongoDB Atlas
- A live deployment is **mandatory**.

**Monorepo layout**
```
/frontend
/backend
/docs
README.md
CLAUDE.md
```

---

## 4. Branding

- Primary: **Gold `#D4AF37`**, **Black `#000000`**
- Add neutrals: near-black surfaces (`#0A0A0A`, `#111`, `#1A1A1A`), greys for text with AA contrast, gold gradients (`#D4AF37 → #F5E27A → #B8941F`)
- Fonts: **Inter** (primary, via `next/font`, subset + `display: swap`); Poppins/Montserrat only for display headings if needed
- Tone: premium, professional, innovative, trustworthy, technology-focused, business-oriented
- Visual language: glass + metallic surfaces, depth, parallax, gold emissive glow on black, subtle particles, cinematic transitions, advanced typography, micro-interactions
- Define tokens once in `tailwind.config` / CSS variables. No random hex codes in components.

---

## 5. 3D & Animation Rules (HIGHEST PRIORITY)

3D must be **meaningful, purposeful and performant**. No random effects.

### Global rules
- All 3D components: `next/dynamic` with `ssr: false`, wrapped in `<Suspense>`, with a **static fallback** (gradient / image / CSS animation).
- Cap pixel ratio: `dpr={[1, 1.5]}` (desktop), `1` on low-end/mobile.
- Use **InstancedMesh** for repeated objects, **reuse** geometries/materials, dispose on unmount.
- Prefer **primitive geometry + good materials/lighting** over heavy models. If using GLB: Draco/meshopt compressed, < ~1-2 MB, textures ≤ 1024px.
- Pause rendering when off-screen (IntersectionObserver → `frameloop="demand"`/`"never"` or toggle). Pause when tab hidden.
- Use `useFrame((state, delta) => ...)` with **delta time**; never allocate objects (Vector3, etc.) inside `useFrame`.
- **Never trigger React re-renders per frame.** Share scroll/pointer state through refs or a small store (zustand) and read it inside `useFrame`.
- Respect `prefers-reduced-motion` (disable/slow animations, stop auto-rotate).
- Handle **WebGL failure** and **context loss** gracefully with a fallback.
- Limit simultaneous canvases (ideally 1-2 live WebGL contexts at a time; mount scenes only when near viewport, unmount when far).

### Mobile / device strategy (mandatory)
Create `lib/device.ts` + a `useDeviceTier()` hook returning `"high" | "medium" | "low"` based on: viewport, `navigator.hardwareConcurrency`, `deviceMemory`, `detect-gpu` (optional), `prefers-reduced-motion`, `saveData`.
- **high**: full scene
- **medium**: reduced node count, lower DPR, no postprocessing, fewer lights
- **low / WebGL unavailable**: static image or CSS/SVG animated fallback
- Optional gyroscope tilt on mobile only where permission is granted.

### 3D map (one idea per section, reusable)
| Area | Experience | Tech |
|---|---|---|
| **Home Hero** | Interactive "digital ecosystem": metallic/glass central sphere + 60-120 gold connected nodes (instanced) with lines between nearby nodes. Cursor parallax, node hover highlight, scroll-linked rotation/zoom, slow idle drift, optional mobile tilt. Represents technology, transformation, connected systems, growth. | R3F, Drei, Lenis |
| **Digital Transformation** | Pinned, scrubbed scroll story: Business Challenge → Strategy → Design → Technology → Launch → Growth. One 3D object morphs per stage (scattered fragments → organized grid → structured form → connected network → rising growth shape). Titles/descriptions fade in sync. | GSAP ScrollTrigger, Lenis, R3F |
| **Services (home)** | 6 interactive tiles, each with its own mini 3D/visual treatment, linking to its page. | R3F, Drei, Motion |
| **Service pages** | Same `ServiceScene` component as interactive hero of `/services/[slug]`. | R3F |
| **Technology Ecosystem** | Orbiting constellation of tech nodes (React, Next.js, Node.js, MongoDB, MySQL, JavaScript, Three.js, R3F, WordPress…) on multiple rings, hover pauses + tooltip, drag/scroll rotates. Data-driven. | R3F, Drei `<Html>`/`<Billboard>` |
| **Portfolio case study** | At least one case study with an interactive/3D presentation (e.g., rotatable device mockup showing project screens). | R3F, Drei |
| **About** | Interactive timeline since 2021 (scroll-driven, with subtle 3D/depth). | GSAP ScrollTrigger, Motion |

Requirement: **at least 3 major sections/pages with meaningful interactive visuals** (target: Hero, Transformation story, Services, Tech ecosystem, one case study).

### `ServiceScene` spec (single reusable component, `type` prop)
1. `web-development` — floating browser window with animated code/UI layers
2. `app-development` — 3D smartphone with rotating screens, hover tilt
3. `digital-marketing` — animated 3D bar/line growth visualization
4. `ar-vr` — headset/portal-like immersive environment with floating objects
5. `3d-modeling` — rotatable object (OrbitControls, drag to rotate)
6. `ui-ux-design` — floating UI cards/wireframe elements with depth

### Smooth scroll
Lenis provider at the root, synced with ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add`, `gsap.ticker.lagSmoothing(0)`). Clean up all triggers on unmount (`gsap.context` / `useGSAP`). Disable Lenis for reduced-motion.

---

## 6. Website Structure (routes)

```
/                               Home
/services                       Services overview
/services/[slug]                web-development | app-development | digital-marketing | ar-vr | 3d-modeling | ui-ux-design
/portfolio                      Portfolio listing
/portfolio/[slug]               Case study (puratap, wanaromah, laxmi-astro-ai, tony-and-guy, studio11,
                                sivam-physio-care, pearl-housing, nugenica-biotech-lab, visdoc, cube-dental)
/about
/blog
/blog/[slug]
/careers
/careers/[slug]
/contact
/business-health-checkup
/software-project-planning-guide
/admin                          Admin dashboard (protected)
```

Shared: sticky responsive navbar (with mobile menu), footer, global CTA ("Book a Free Consultation"), WhatsApp floating button, SEO metadata per page, 404 page.

---

## 7. Dynamic Content Architecture (NO hardcoded per-item pages)

Pattern: **Data → Reusable Template → Many pages.**

- `data/services.ts` → `ServicePageTemplate` → 6 pages via `generateStaticParams`
- `data/projects.ts` → `CaseStudyTemplate` → all case studies
- `data/posts.ts` (or API) → `BlogPostTemplate`
- `data/jobs.ts` (or API) → `JobTemplate`
- `data/technologies.ts`, `data/milestones.ts`, `data/testimonials.ts`

Create a **data-access layer** (`lib/api.ts` / `lib/content.ts`) so content can switch from local JSON to backend API/Strapi/Sanity/WordPress later without touching components. Define TypeScript types for `Service`, `Project`, `Post`, `Job`, `Technology`.

I must be able to answer: *"How would the company add another service, project, blog post or job without rebuilding the page?"* → Answer: add a data entry / DB record; the template renders it.

### Service page template sections
Interactive hero (ServiceScene) · Problem · Solution · Key features · Industry use cases · Technology stack · Process · Related portfolio · CTA **"Get a Quote"**.

### Case study template sections
Client · Industry · Challenge · Solution · Technologies · Results · Visuals · Related services (+ optional interactive/3D block).

---

## 8. Homepage Spec

1. **Hero** — Headline: *"Custom Software & Digital Solutions to Grow Your Business"*
   Subtext: *"Web & App Development, UI/UX Design, and Business Strategy – all tailored to your needs."*
   Primary CTA: **Book a Free Consultation** · Secondary CTA: **Explore Our Solutions**
   + interactive 3D hero (see §5).
2. **Digital Transformation** scroll story (see §5).
3. **Services** — 6 interactive 3D/visual tiles linking to service pages.
4. **Technology Ecosystem** — orbiting constellation.
5. **Why Riyadvi** — "Since 2021" interactive timeline · Business Health Checkup explainer (CTA to `/business-health-checkup`) · End-to-End Solutions journey: Strategy → Design → Development → Marketing → Optimization → Growth.
6. **Featured portfolio** — cards linking to case studies.
7. **Lead CTAs** — Business Health Checkup + Planning Guide download.
8. **Footer CTA.**

---

## 9. Forms, Leads & Backend

### Frontend forms (react-hook-form + zod, inline errors, loading/success/error states, accessible labels)
- **Contact** (`/contact`): name, email, phone, company, requirement, message. Plus Calendly embed/link, WhatsApp link, optional map.
- **Consultation request** (hero CTA / modal): name, email, phone, preferred date/time, requirement.
- **Business Health Checkup** (`/business-health-checkup`): headline *"Is Your Business Ready for Its Next Digital Growth Stage?"* — interactive **multi-step** form with progress indicator: (1) Business Information (2) Website & Digital Presence (3) Marketing (4) Technology (5) Business Challenges (6) Review & Submit. Persist step state; animate transitions.
- **Lead magnet** (`/software-project-planning-guide`): title *"Download Software Project Planning Guide"*; fields name, company, email, phone; validate → POST → store → show download link/confirmation.
- **Job application** (`/careers/[slug]`): name, email, phone, position, resume (PDF/DOC, size/type limits), message.

### API endpoints
```
POST /api/contact
POST /api/consultation
POST /api/health-checkup
POST /api/lead-magnet
POST /api/applications          (multipart, resume)

GET  /api/services, /api/services/:slug
GET  /api/projects, /api/projects/:slug
GET  /api/posts,    /api/posts/:slug
GET  /api/jobs,     /api/jobs/:slug

POST /api/admin/login
GET  /api/admin/stats
GET  /api/admin/enquiries            (+ PATCH /:id/status)
GET  /api/admin/consultations
GET  /api/admin/health-checkups
GET  /api/admin/lead-magnet
GET  /api/admin/applications
GET  /api/health                     (health check)
```

### Backend requirements
- Layered structure: `routes/ → controllers/ → services/ → models/`, plus `middleware/` (validate, error handler, auth, rate-limit) and `config/`.
- **Validation** on every POST (zod/express-validator), sanitize input.
- **Consistent response shape:** `{ success: boolean, message: string, data?: any, errors?: [...] }` with correct HTTP status codes.
- Central **error-handling middleware**; no stack traces in production.
- **Env vars** for all secrets (`.env.example` committed, `.env` ignored).
- helmet, CORS allow-list (Vercel domain + localhost), rate limiting on form routes, honeypot/spam protection.
- Email notification on new enquiry (nodemailer; fail gracefully, never block the DB save).
- Resume upload: validate type/size, store safely (local/cloud), save path/URL in DB.

### Mongoose models
`ContactEnquiry` (name, email, phone, company, requirement, message, status: new|contacted|closed, createdAt) ·
`ConsultationRequest` · `HealthCheckupLead` (stepwise answers + contact) · `LeadMagnetLead` ·
`CareerApplication` (job ref, resume URL, status) ·
API-ready: `Service`, `Project`, `Post`, `Job` (seed script provided).

### Admin dashboard (`/admin`, basic but real)
- Protected login.
- **Dashboard:** total enquiries, consultation requests, health checkup leads, lead magnet leads, job applications.
- **Enquiries table:** name, email, phone, company, requirement, date, status (editable).
- **Careers:** view submitted applications (+ resume link).
- Not a full CRM; demonstrate full-stack understanding.

---

## 10. Page-specific Requirements

**Services overview / pages:** no static cards; each service has an interactive visual treatment and its own page.
**Portfolio:** premium dynamic listing (filter by industry/service), cards → `/portfolio/[slug]`. At least one case study with interactive/3D presentation.
**About:** story, founded 2021, vision, mission, values, approach, awards/recognition, milestones (animated timeline), optional team.
**Blog:** featured article, categories, tags, search, article cards, article page, related articles. Structure so Strapi/Sanity/WordPress/DB can be plugged in later.
**Careers:** listings with **department, designation and experience filters**; job detail (responsibilities, requirements, apply button → application form).
**Contact:** form + backend + DB + email + WhatsApp + Calendly (+ optional map).

Provide realistic sample content (portfolio projects listed above, 4-6 blog posts, 3-5 jobs). Content can be refined from the existing Riyadvi website; improve copy where appropriate.

---

## 11. Performance Checklist

- Lazy-load + code-split all 3D and below-the-fold sections (`next/dynamic`).
- `next/image` with correct sizes, modern formats, priority only for LCP image.
- `next/font` (Inter), subset, `display: swap`.
- 3D: instancing, compressed GLB, small textures, no postprocessing on medium/low tiers, cap DPR, off-screen pause.
- Animate only `transform`/`opacity`; avoid layout thrash; use `will-change` sparingly.
- Server Components by default; `"use client"` only where needed.
- Avoid heavy dependencies; check bundle with `@next/bundle-analyzer`.
- Target Lighthouse: Performance 80+ mobile (best effort), Accessibility 90+, SEO 90+.
- **Usability must never be sacrificed for effects.** Content/CTAs visible even if 3D fails.

---

## 12. Accessibility & Responsiveness

- Must work on desktop, laptop, tablet, mobile (test 360px → 1920px).
- Semantic HTML, keyboard navigation, visible focus states, AA contrast (gold on black is fine; check gold on grey).
- `prefers-reduced-motion` support everywhere.
- Canvas gets `aria-hidden` / decorative; all info also available as real text.

---

## 13. Git Rules

- Frequent commits using **Conventional Commits**. No giant "Initial commit".
- Examples:
  `feat: implement interactive 3D hero` · `feat: create dynamic service pages` ·
  `feat: implement portfolio case study architecture` · `feat: add contact API` ·
  `feat: integrate MongoDB` · `feat: add business health checkup` ·
  `perf: optimize 3D assets` · `fix: improve mobile navigation` · `docs: update AI usage log`
- After completing each step, **output the suggested commit message**.

---

## 14. AI Usage Log (required for README)

Maintain `/docs/AI_LOG.md`. After each major generated piece, append an entry:

```
### <Feature name>
- AI Tool: Claude Code
- Purpose:
- Prompt: (the actual prompt I used)
- What was generated:
- What I manually changed: (leave a TODO for me to fill - I must edit/understand the code)
- Why this tool: 
```
Also remind me at the end of each step: **"What should you change/tune manually in this code so it's genuinely yours?"** (e.g., node count, easing, colors, camera, structure) and suggest 2-3 concrete tweaks.

---

## 15. README Requirements (generate/update at the end)

Project overview · Features · Tech stack · Installation · Environment variables · Database setup (+ seed) · API endpoints · Deployment instructions · **AI Tools Used** (tool, purpose, example prompt, what was generated, what was manually changed, why selected) · 3D libraries used · Animation libraries used · Third-party assets/credits · Performance optimizations · Known limitations · Future improvements · Live URLs (frontend + backend).

---

## 16. Interview Walkthrough Prep (10-15 min)

Keep `/docs/WALKTHROUGH.md` with short answers to:
1. Why this design direction?
2. How was the 3D implemented?
3. Which AI tools, and why?
4. What was AI-generated vs manually built?
5. How do frontend, backend, DB connect?
6. How to add a new service/project/post/job without rebuilding?
7. How was 3D optimized?
8. Biggest technical challenges?
9. What would I improve with 1-2 more weeks?

---

## 17. Do NOT

- Do not build a single long scrolling page or a landing page only.
- No static service/portfolio cards without their own pages.
- No fake forms — every form hits the backend and DB.
- No frontend-only implementation.
- No random 3D with no purpose; no excessive animation that slows the site.
- No copy-pasted sites or unmodified AI templates.
- No secrets in the repo; no `localStorage` for sensitive data.
- Don't install libraries you don't visibly use.

---

## 18. Working Protocol (follow in every session)

1. Before coding, restate the task in 1-2 lines and list files you'll create/change.
2. Implement in small, reviewable steps.
3. Explain key decisions briefly (interview-ready).
4. Mention performance + mobile implications of anything 3D.
5. End each step with: ✅ what was done · 📝 suggested commit message · ✋ what I should manually tweak/verify · ➡️ proposed next step.
6. If something is ambiguous, make a sensible assumption, state it, and continue.

### Suggested build order
1. Project setup, folder structure, Tailwind tokens, fonts, layout (navbar/footer), Lenis provider, device-tier hook
2. 3D hero (+ fallback) → homepage skeleton
3. Digital Transformation scroll story
4. Data layer + `ServiceScene` + service overview + `/services/[slug]` template
5. Portfolio listing + case-study template (+ one 3D case study)
6. Backend setup (Express, Mongo, models, validation, error handling) + contact/consultation APIs
7. Health Checkup multi-step form + Lead magnet page + APIs
8. Tech ecosystem constellation, Why Riyadvi/timeline, About
9. Blog + Careers (+ application API, resume upload)
10. Admin dashboard
11. Performance + mobile pass (audit all scenes), accessibility pass
12. Deployment (Vercel + Render/Railway + Atlas), README, AI log, walkthrough notes

**Start by confirming you've read this file, then propose the exact folder structure for `/frontend` and `/backend`. Do not write feature code yet.**