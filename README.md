# Riyadvi Software Technologies — Website Revamp

A multi-page, full-stack corporate website for **Riyadvi Software Technologies**, positioned as
*a technology & digital solutions partner, not just a software vendor*. Premium gold-on-black design,
real-time 3D throughout, a working lead pipeline and an admin dashboard.

| | URL |
|---|---|
| **Frontend (Vercel)** | `TODO: https://<project>.vercel.app` |
| **Backend API (Render)** | `TODO: https://<service>.onrender.com/api/health` |

> The free Render instance sleeps after inactivity; the first request can take ~30–50 s. The site
> pings the API on load to wake it, and forms wait up to 45 s.

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

**Lead generation & backend:** contact/quote form · consultation booking · 6-step Business Health
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
| Backend | Node.js 22, Express 5, Mongoose 9, Zod, helmet, cors, express-rate-limit, multer, nodemailer, jsonwebtoken, bcryptjs |
| Database | MongoDB (Atlas in production), GridFS for resumes |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas |

**3D libraries used:** three, @react-three/fiber, @react-three/drei.
**Animation libraries used:** gsap (+ ScrollTrigger, @gsap/react), lenis, motion.

---

## Architecture

```
Browser ──fetch /api/*──▶ Next.js (Vercel) ──rewrite──▶ Express (Render) ──▶ MongoDB Atlas
Next.js server ── lib/content.ts (ISR, 60 s, local fallback) ──▶ GET /api/services|projects|posts|jobs
```

```
/frontend   Next.js app
  src/app            routes: (site) public pages, admin/ dashboard
  src/components     sections, templates (Service/CaseStudy/BlogPost/Job), forms, admin
  src/three          canvas (one shared <Canvas>), scenes, fallbacks, state, utils
  src/data           typed content (services, projects, posts, jobs, checkup config…)
  src/lib            content.ts (data-access layer), device.ts (GPU tiering), apiClient…
/backend    Express API — routes → controllers → services → models, middleware, validators, seed
/docs       AI_LOG.md (AI usage per step), WALKTHROUGH.md (interview notes)
```

**Adding a service / project / post / job without rebuilding:** pages only read through
`lib/content.ts`. With `CONTENT_SOURCE=api` it fetches from the API with ISR; a new MongoDB record
appears on the next revalidation, and unknown slugs render on first request. A new service picks an
existing 3D visual through its `sceneType` field. *Verified:* a service inserted only into MongoDB
rendered at its URL on a build that had never seen it.

---

## Getting started (local)

Requirements: Node.js ≥ 20.9, MongoDB (local or Atlas).

```bash
# 1. Backend
cd backend
cp .env.example .env            # set MONGODB_URI, CORS_ORIGINS, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed                    # upserts content + admin account (idempotent); admin only: npm run seed:admin
npm run seed:demo               # optional: fictional demo leads so the admin dashboard has data
npm run dev                     # http://localhost:5000/api/health

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                     # http://localhost:3000   (admin: /admin/login)
```

Content lives in `frontend/src/data/*.ts`. After editing it, run `npm run export:content` in
`frontend`, then `npm run seed` in `backend`.

### Environment variables

**Frontend** (`frontend/.env.local`, Vercel project settings)

| Variable | Purpose |
|---|---|
| `BACKEND_URL` | Express base URL, used by the `/api` rewrite and server-side fetches. **Must be set before building** (rewrites are resolved at build time) |
| `CONTENT_SOURCE` | `local` (bundled data) or `api` (MongoDB via the API, with local fallback). Use `api` in production |
| `NEXT_PUBLIC_SITE_URL` | Public URL (canonical links, sitemap, Open Graph) |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CALENDLY_URL` | Contact channels shown on the site |

**Backend** (`backend/.env`, Render environment)

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `CORS_ORIGINS` | Comma-separated allowed origins; must include the frontend domain |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account, written to MongoDB (bcrypt hash) by `npm run seed` / `seed:admin`; login checks the DB, falling back to these until seeded. Optionally use `ADMIN_PASSWORD_HASH` (bcrypt, `npm run hash-password`) instead of the plain password |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Session signing (32+ random chars) and lifetime |
| `TRUST_PROXY` | Proxy hops in front of the app (2 on Vercel → Render) so rate limits see real IPs |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `NOTIFY_TO` | Optional email notifications (disabled when `SMTP_HOST` is empty) |
| `GUIDE_DOWNLOAD_URL` | Path of the lead-magnet PDF |
| `NODE_ENV`, `PORT` | Runtime |

### Database setup

MongoDB Atlas (free M0) → create a database user → network access `0.0.0.0/0` (Render has no fixed IP on
the free plan) → copy the `mongodb+srv://…/riyadvi` string into `MONGODB_URI`. Collections and indexes
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
2. **Backend → Render:** New → Blueprint → this repo (uses `render.yaml`, root `backend/`). Fill in
   `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and set `CORS_ORIGINS` to the Vercel URL.
   Seed once from your machine: `cd backend && MONGODB_URI="<atlas uri>" npm run seed`.
3. **Frontend → Vercel:** import the repo, **Root Directory = `frontend`**, set `BACKEND_URL` to the
   Render URL, `CONTENT_SOURCE=api`, `NEXT_PUBLIC_SITE_URL` and the contact variables, then deploy.
4. Update `CORS_ORIGINS` on Render if the final Vercel domain differs, then smoke-test every form and
   `/admin`.

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
| **Purpose** | Architecture planning, code generation for frontend/backend/3D, debugging, automated verification (type-check, lint, builds, Playwright E2E, Lighthouse, axe), documentation |
| **Example prompt** | *"Deep analyze the full prompt and PDF; the main focus is 3D"* → produced the architecture plan (one shared canvas with Drei View, API + ISR content, GridFS resumes) that every later step followed. Each step was then approved with a short prompt after reviewing the plan. |
| **What was generated** | Most of the code, in 11 reviewed steps, each verified on a real GPU and in mobile emulation |
| **What was manually changed** | **TODO (me):** list the parameters, copy and code I changed myself (see the "make it yours" notes per step in the AI log) |
| **Why this tool** | It reads the installed library versions' own docs and source before coding (Next 16, R3F 9, Drei 10, Express 5, Mongoose 9, Zod 4 are all newer than most training data) and verifies its own output end to end, which caught real bugs before they shipped |

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
  replacement in `notification.service.js`).
- Render free tier cold starts; device tilt is not enabled on iOS (requires a permission prompt).
- Git history is grouped by feature, committed after development rather than live, so intermediate
  commits aren't guaranteed to build on their own.

## Future improvements

- Headless CMS (Sanity/Strapi) behind `lib/content.ts` + on-demand revalidation webhooks.
- Signed, expiring download links for the guide; email delivery of checkup results.
- Smaller 3D start-up: KTX2/precompiled shaders, splitting the 3D bundle per scene.
- Admin: CSV export, notes per lead, multiple users with roles.
- Automated test suite (API integration tests, Playwright E2E in CI).
- Analytics and conversion tracking on every CTA.
