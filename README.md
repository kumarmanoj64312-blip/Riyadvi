# Riyadvi Software Technologies — Website Revamp

A multi-page, full-stack corporate website for **Riyadvi Software Technologies**, positioned as
*a technology & digital solutions partner, not just a software vendor*. Premium gold-on-black design,
real-time 3D throughout, a working lead pipeline and an admin dashboard.

| | URL |
|---|---|
| **Website + API (Vercel)** | https://riyadvi-seven.vercel.app (health check: [/api/health](https://riyadvi-seven.vercel.app/api/health)) |

> One Next.js app serves both the pages and the REST API (Route Handlers under `/api`), so there is a
> single deployment, no CORS and no sleeping backend to wake.

---

## Features

**Pages (all data-driven):** Home · Services + 6 service pages · Portfolio + 10 case studies · About ·
Blog + articles · Careers + job pages · Contact · Business Health Checkup · Software Project Planning
Guide · Admin dashboard · 404 / error pages.

**3D & interaction (5 WebGL experiences, one shared canvas):**

| Where | Experience |
|---|---|
| Home hero | "Digital ecosystem": metal core + ~110 instanced nodes and links. Cursor/tilt parallax, node hover lights its connections, GPU-animated data pulses, scroll-linked rotation and dolly |
| Home · Our approach | Pinned scroll story; one point cloud morphs through 6 formations (scattered → grid → structure → network → helix → growth chart) in a vertex shader driven by GSAP ScrollTrigger |
| Services (home tiles, overview, every service page) | One `ServiceScene` component, six visuals: exploding browser layers, phone with orbiting screens, growth chart, AR/VR portal, drag-to-rotate torus knot with wireframe reveal, UI cards snapping into a layout |
| Technology ecosystem | Data-driven orbiting constellation; hover pauses a ring, drag rotates; labels are real DOM text positioned by the 3D scene |
| Case studies | Rotatable phone / laptop showing the project's screens (runtime canvas textures); tap to switch screens |
| About / Why Riyadvi | Scroll-driven timeline (GSAP: scrubbed line, CSS-3D swing-in, parallax years) |

**Lead generation & API:** contact/quote form · consultation booking · 6-step Business Health
Checkup with server-side scoring and recommendations · lead-magnet PDF download · job applications with
resume upload · all stored in MongoDB · email notification to the team · admin dashboard with stats,
search, status updates and resume download.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4 |
| 3D | Three.js 0.186, React Three Fiber 9, Drei 10, custom GLSL shaders |
| Animation | GSAP 3 + ScrollTrigger, Lenis (smooth scroll), Motion 14 (LazyMotion) |
| Forms | react-hook-form + Zod 4 (schemas mirror the server) |
| State | zustand (low-frequency 3D state only; per-frame input lives in plain refs) |
| API (same app) | Next.js Route Handlers on Node.js 22, Mongoose 9, Zod, nodemailer, jsonwebtoken, bcryptjs |
| Database | MongoDB (Atlas in production), GridFS for resumes |
| Hosting | Vercel (one project: pages + API), MongoDB Atlas |

**3D libraries used:** three, @react-three/fiber, @react-three/drei.
**Animation libraries used:** gsap (+ ScrollTrigger, @gsap/react), lenis, motion.

---

## Architecture

```
Browser ──fetch /api/*──▶ Route Handler (src/app/api) ──▶ src/server services ──▶ MongoDB Atlas
Server Components ── lib/content.ts (ISR 60 s, local fallback) ──▶ src/server services ──▶ MongoDB
Admin pages ──── lib/adminServer.ts (session check) ──────────▶ src/server services ──▶ MongoDB
```

The API keeps the layered design of a classic Express backend, just inside the Next.js app:

| Express concept | Here |
|---|---|
| `routes/` | `src/app/api/**/route.ts` — one file per endpoint, a few lines each |
| middleware (rate limit, validate, honeypot, error handler) | small functions in `src/server/utils` composed by `route()` / `formRoute()` |
| `controllers/` + `services/` | `src/server/services` (business logic, reused by pages and seeders) |
| `models/` | `src/server/models` (Mongoose, hot-reload safe) |
| `server.js` (`connect` + `listen`) | `src/server/config/db.ts`: lazy connection cached on `globalThis` for serverless |
| helmet / cors | security headers in `next.config.ts`; CORS unnecessary (same origin) |
| multer | `request.formData()` + size/type/magic-byte checks (`src/server/utils/upload.ts`) |

```
/frontend   Next.js app (website + API)
  src/app            routes: (site) public pages, admin/ dashboard, api/ REST endpoints
  src/server         API internals: config, models, validators, services, utils, seed
  src/components     sections, templates (Service/CaseStudy/BlogPost/Job), forms, admin
  src/three          canvas (one shared <Canvas>), scenes, fallbacks, state, utils
  src/data           typed content (services, projects, posts, jobs, checkup config…)
  src/lib            content.ts (data-access layer), device.ts (GPU tiering), apiClient…
  scripts            seeders (npm run seed / seed:admin / seed:demo), hash-password
/docs       AI_LOG.md (AI usage per step), WALKTHROUGH.md (interview notes)
```

**Adding a service / project / post / job without rebuilding:** pages only read through
`lib/content.ts`. With `CONTENT_SOURCE=api` it reads MongoDB with ISR; a new MongoDB record
appears on the next revalidation, and unknown slugs render on first request. A new service picks an
existing 3D visual through its `sceneType` field. *Verified:* a service inserted only into MongoDB
rendered at its URL on a build that had never seen it.

---

## Getting started (local)

Requirements: Node.js ≥ 20.9, MongoDB (local or Atlas).

```bash
cd frontend
cp .env.example .env            # set MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET
npm install
npm run seed                    # upserts content + admin account (idempotent); admin only: npm run seed:admin
npm run seed:demo               # optional: fictional demo leads so the admin dashboard has data
npm run dev                     # http://localhost:3000 · API: /api/health · admin: /admin/login
```

Content lives in `frontend/src/data/*.ts`; `npm run seed` reads those files directly, so editing them
and re-seeding is all it takes.

### Environment variables

All in `frontend/.env` locally and in the Vercel project settings. Only `NEXT_PUBLIC_*` values reach
the browser; everything else stays on the server.

| Variable | Purpose |
|---|---|
| `CONTENT_SOURCE` | `local` (bundled data) or `api` (MongoDB, with local fallback). Use `api` in production |
| `NEXT_PUBLIC_SITE_URL` | Public URL (canonical links, sitemap, Open Graph) |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CALENDLY_URL` | Contact channels shown on the site |
| `MONGODB_URI` | MongoDB connection string |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account, written to MongoDB (bcrypt hash) by `npm run seed` / `seed:admin`; login checks the DB, falling back to these until seeded. Optionally use `ADMIN_PASSWORD_HASH` (bcrypt, `npm run hash-password`) instead of the plain password |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Session signing (32+ random chars) and lifetime |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `NOTIFY_TO` | Optional email notifications (disabled when `SMTP_HOST` is empty) |
| `GUIDE_DOWNLOAD_URL` | Path of the lead-magnet PDF |

### Database setup

MongoDB Atlas (free M0) → create a database user → network access `0.0.0.0/0` (Vercel functions have no fixed
IP) → copy the `mongodb+srv://…/riyadvi` string into `MONGODB_URI`. Collections and indexes
are created automatically; `npm run seed` loads the content and creates the admin account. Lead collections are never touched by the
seed.

---

## API

All responses: `{ success, message, data?, errors?: [{ field, message }] }`.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | uptime + DB state |
| POST | `/api/contact`, `/api/consultation` | rate-limited, honeypot, Zod-validated |
| POST | `/api/health-checkup` | answers validated against the questionnaire config → score + recommendations |
| POST | `/api/lead-magnet` | stores lead, returns the guide URL |
| POST | `/api/applications` | multipart; PDF/DOC/DOCX ≤ 5 MB, magic-byte checked, stored in GridFS |
| GET | `/api/services`, `/api/projects`, `/api/posts`, `/api/jobs` (+ `/:slug`) | published content |
| POST | `/api/admin/login`, `/api/admin/logout` | httpOnly session cookie |
| GET | `/api/admin/me`, `/api/admin/stats` | 🔒 |
| GET | `/api/admin/:collection` | 🔒 enquiries · consultations · health-checkups · lead-magnet · applications (`?q=&status=&page=`) |
| PATCH | `/api/admin/:collection/:id/status` | 🔒 JSON only (CSRF guard) |
| GET | `/api/admin/applications/:id/resume` | 🔒 resume download |

---

## Deployment

1. **MongoDB Atlas:** create the cluster and user as above.
2. **Seed once** from your machine with the Atlas URI in `frontend/.env`: `cd frontend && npm run seed`.
3. **Vercel:** import the repo, **Root Directory = `frontend`**, add the environment variables above
   (`MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, `CONTENT_SOURCE=api`,
   `NEXT_PUBLIC_SITE_URL`, contact variables), then deploy. Pages and API ship together.
4. Smoke-test `/api/health` (should report `"db":"connected"`), every form and `/admin`.

---

## Performance

- **One WebGL context** for the whole site (Drei `View`); scenes mount near the viewport and stop
  rendering and updating off-screen; the canvas sleeps when nothing is visible.
- **Device tiering by measurement:** an on-device GPU micro-benchmark (~3 ms on a real GPU vs ~34 ms
  emulated) plus `failIfMajorPerformanceCaveat`, memory/cores/data-saver signals → high / medium / low.
  Low devices never download the 3D bundle and get SVG fallbacks built from the same geometry.
- **Runtime FrameGuard:** if real frames can't hold ~20 fps, the session switches to fallbacks.
- 3D starts after load + idle; medium tier skips the environment map; DPR capped (1.5 / 1).
- Instancing (110 nodes = 1 draw call), GPU-side animation (morph, pulses), no per-frame allocations or
  React renders.
- Three.js/R3F code-split; GSAP loaded dynamically; Motion via `LazyMotion`.
- Fallback SVGs drawn as a few bucketed paths: home HTML 582 KB → 228 KB.
- `next/font` (Inter, self-hosted, swap), Server Components by default.

**Lighthouse (local production build):** Accessibility, Best Practices and SEO 100 on all key pages;
Performance 96–100 desktop on most pages and 62–81 mobile; the 3D-heavy home page is lower on mobile
(see limitations). axe-core: 0 violations across 12 pages at desktop and mobile widths.

---

## AI tools used

The full per-step log (prompts, what was generated, bugs found, decisions) is in
[`docs/AI_LOG.md`](docs/AI_LOG.md).

| | |
|---|---|
| **Tool** | Claude Code (Claude Opus), agentic coding in VS Code |
| **Purpose** | Architecture planning, code generation for the UI, API and 3D, debugging, automated verification (type-check, lint, builds, Playwright E2E, Lighthouse, axe), documentation |
| **Example prompt** | *"Deep analyze the full prompt and PDF; the main focus is 3D"* → produced the architecture plan (one shared canvas with Drei View, API + ISR content, GridFS resumes) that every later step followed. Each step was then approved with a short prompt after reviewing the plan. |
| **What was generated** | Most of the code, in 11 reviewed steps, each verified on a real GPU and in mobile emulation |
| **What was manually changed** | **TODO (me):** list the parameters, copy and code I changed myself (see the "make it yours" notes per step in the AI log) |
| **Why this tool** | It reads the installed library versions' own docs and source before coding (Next 16, R3F 9, Drei 10, Mongoose 9, Zod 4 are all newer than most training data) and verifies its own output end to end, which caught real bugs before they shipped |

**Bugs found through AI-run testing** (details in the log): an admin login redirect loop (cookie path),
a swallowed "Next" click in the multi-step form (layout shift at mousedown), 3D running on emulated GPUs
(7.8 s mobile blocking time), mobile overflow from grid `min-width`, and a career filter counting ranges
that only touched.

---

## Third-party assets & credits

- No stock photos, scraped screenshots or downloaded 3D models: all visuals are generated (Three.js
  primitives and shaders, CSS mockups, runtime canvas textures, SVG).
- Font: Inter (SIL Open Font License) via `next/font`.
- Technology names in the ecosystem section are trademarks of their owners (text only, no logos).
- Client names come from Riyadvi's existing portfolio.

---

## Known limitations

- **Sample content:** case-study result figures, milestone details, blog posts and job openings are
  illustrative and marked as such in `src/data`; replace with approved real content. No testimonials are
  included on purpose (they must be real).
- **Mobile performance on the home page:** real-time 3D costs ~1.5 s of extra main-thread work on a
  throttled mid-range phone (bundle parse + shader compile). Weak devices are protected by tiering and
  the FrameGuard, but capable phones still pay it.
- **Lead magnet is soft-gated:** the PDF is a static file, reachable by direct URL.
- **Single admin account**, seeded into MongoDB from `.env`; no roles, user management UI or password-reset flow.
- **Email** depends on the SMTP provider; some free hosts block SMTP ports (an HTTP email API is a drop-in
  replacement in `src/server/services/notification.service.ts`).
- **Rate limits are per server instance** (in-memory): on serverless each function instance counts
  separately. Fine against casual abuse; use Redis/Upstash for strict global limits (one file to change).
- Serverless cold starts add a second or two to the first API request; device tilt is not enabled on iOS
  (requires a permission prompt).
- Git history is grouped by feature, committed after development rather than live, so intermediate
  commits aren't guaranteed to build on their own.

## Future improvements

- Headless CMS (Sanity/Strapi) behind `lib/content.ts` + on-demand revalidation webhooks.
- Signed, expiring download links for the guide; email delivery of checkup results.
- Smaller 3D start-up: KTX2/precompiled shaders, splitting the 3D bundle per scene.
- Admin: CSV export, notes per lead, multiple users with roles.
- Automated test suite (API integration tests, Playwright E2E in CI).
- Analytics and conversion tracking on every CTA.
