# AI Usage Log

A running record of how AI was used on this project: what was asked, what came back,
and what was changed by hand. Feeds the **AI Tools Used** section of the README.

> Entries marked `TODO (me)` must be filled in by me after I've reviewed and edited the code.

---

### 0. Brief analysis & architecture plan
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Analyse the 27-page assignment PDF against my CLAUDE.md spec, find gaps/risks, and propose a folder structure and 3D architecture.
- **Prompt:** "Deep analyze the full prompt and pdf also the main focus is 3d"
- **What was generated:** Gap/risk table (ISR vs "no rebuild", Render ephemeral disk, cross-domain cookies, WebGL context limits, OneDrive + node_modules), scene-by-scene 3D plan (single global canvas + Drei `<View>`, GPU morph shader, instancing), monorepo folder structure.
- **What I manually changed:** TODO (me) — which recommendations I accepted/rejected and why.
- **Why this tool:** Long-context reasoning over a full PDF + spec file in one pass, inside the repo where it can later act on the plan.

### 1. Project setup & foundation
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Scaffold Next.js 16, design tokens, layout chrome, smooth scrolling and device tiering.
- **Prompt:** "start the work and follow the proper folder structure also"
- **What was generated:**
  - Tailwind v4 `@theme` tokens (gold/black palette, AA-checked greys, premium easing) in `src/styles/globals.css`
  - `(site)` route group layout, root layout with `next/font` Inter, 404 page
  - `Navbar` (glass-on-scroll), `MobileMenu` (Motion stagger, Esc/focus/scroll-lock), `Footer` with CTA band, `WhatsAppButton`, `Button`
  - `LenisProvider` driven by GSAP's ticker and synced with ScrollTrigger; disabled for reduced motion
  - `lib/device.ts` + `useDeviceTier` (WebGL probe, software-renderer detection, cores/memory/saveData/viewport → high/medium/low)
- **Debugging done during the step (AI-found, verified with Playwright screenshots):**
  - Fixed-position mobile menu was trapped inside the header because `backdrop-filter` creates a containing block → moved it outside `<header>`.
  - Navbar CTA overlapped the logo at 360px: `hidden` lost to the Button's own `inline-flex` → wrapper element controls visibility.
  - Stale `.next/types` after moving `page.tsx` into the route group → regenerated with `next typegen`.
- **What I manually changed:** TODO (me) — e.g. tuned Lenis `lerp`, tier thresholds, hero type scale, logo mark.
- **Why this tool:** Agentic workflow — it read the version-matched Next 16 docs in `node_modules` before coding, ran build/lint/type checks and visually verified layouts.

### 2. Interactive 3D hero + shared-canvas architecture
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Build the global WebGL infrastructure and the "digital ecosystem" hero scene.
- **Prompt:** "yes" (approving the proposed Step 2 plan: single global canvas + Drei View, instanced node network, glass/metal core, cursor parallax, hover highlight, scroll-linked rotation)
- **What was generated:**
  - `three/canvas/*`: one fixed global `<Canvas>` (`SceneCanvas`), lazy mount gate (`SceneRoot`), `SceneView` (tier gate, IntersectionObserver preload + on/off-screen, fallback crossfade), `ViewPortal` (Drei `<View>`), error boundary + `webglcontextlost` handling
  - `three/state/*`: zustand store for low-frequency facts (visible views, WebGL lost), plain mutable `pointer` for per-frame input (+ Android tilt)
  - `three/utils/network.ts`: seeded Fibonacci sphere, k-nearest edges, adjacency (pure TS, shared with SVG fallback)
  - Hero scene: `Network` (InstancedMesh + LineSegments, hover lights node + neighbours + links), `DataPulses` (GPU-animated points, one uniform per frame), `CoreSphere` (faceted metal + edge shell + fresnel glow), `StudioLighting` (Lightformer env map rendered once)
  - `HeroFallback`: server-rendered SVG projection of the same network
- **Debugging done during the step (verified with real-GPU Playwright screenshots):**
  - React Compiler lint (`react-hooks/immutability`) rejected mutating a `useMemo` object from event handlers / `useFrame` → moved simulation state to `useRef`.
  - First render: network clipped the viewport and overlapped the headline; glow looked like a flat orange disc; core metal too dark → re-scaled/offset, fresnel power 3→4, intensity 0.9→0.55, lighter bronze base.
  - Mobile: fixed scale overflowed portrait screens → scale derived from `viewport.width`, deeper text gradient.
  - `EPERM` deleting `.next` — OneDrive file locking (reason to move the repo out of OneDrive).
- **What I manually changed:** TODO (me)
- **Why this tool:** It could read the installed Drei `View` source to design around its event/scissor behaviour, then verify on a real GPU.

### 3. Digital Transformation scroll story
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Pinned, scrubbed scroll story (Challenge → Strategy → Design → Technology → Launch → Growth) with a 3D formation per stage.
- **Prompt:** "yes" (approving the proposed Step 3 plan)
- **What was generated:**
  - `data/transformation.ts` + `TransformationStage` type (content separated from presentation)
  - `three/utils/morphLayouts.ts`: six point formations — scattered fragments, blueprint grid, wireframe cube, connected network, rising helix, growth bar chart (pure TS)
  - `MorphScene`: 2,600 points (1,300 on medium) carrying all six positions as attributes; vertex shader blends neighbouring formations with tent weights + per-point stagger + smoothstep easing
  - `StoryScroller`: one ScrollTrigger pins the section and scrubs one timeline (text panels, progress rail, SVG fallback frames) and writes `scrollState.story` for the shader; clickable rail via Lenis `scrollTo`; reduced-motion list mode; sr-only full story
  - `MorphFallback`: the same six formations projected to SVG, crossfaded by the same timeline
- **Debugging done during the step:**
  - Formations clipped at the View's scissor edges, and the mobile formation rendered at ~25% size → R3F's `viewport` inside a Drei View portal doesn't reflect the View's own camera/rect. Replaced with explicit camera maths (`three/utils/camera.ts → visibleArea`) in both the morph and the hero scene.
- **What I manually changed:** TODO (me)
- **Why this tool:** Fast iteration loop — generate, screenshot every stage on a real GPU, diagnose, fix.

### 4. Services: data layer, reusable ServiceScene, dynamic service pages
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Data → template → pages for services, with an interactive 3D visual per service.
- **Prompt:** "yes" (approving the proposed Step 4 plan)
- **What was generated:**
  - `types/content.ts` (`Service`, `ServiceSceneType`), `data/services.ts` (6 services of real copy), `lib/content.ts` data-access layer (`CONTENT_SOURCE=local|api`, ISR via `fetch(..., { next: { revalidate, tags } })`, local fallback, 5s timeout)
  - `ServiceScene` (one component, `params.serviceType` + `variant: tile|hero`) with six bespoke visuals: Web (browser layers explode in depth, code types itself), App (phone with live feed + orbiting screens), Marketing (exponential bars + trend line + pulse), AR/VR (shader portal + objects passing through), 3D Modeling (torus knot, hover reveals wireframe, hero drag-to-rotate with inertia), UI/UX (scattered cards snap into a 3×2 layout on hover) + Generic fallback for CMS-added services
  - SceneView extended with `data-scene-host` hover + local pointer refs and serialisable `params`
  - `ServiceTile` (Motion: staggered entrance, hover lift, cursor spotlight via motion values), `ServicesSection` (home), `/services`, `/services/[slug]` + `ServicePageTemplate`, `Reveal`, `SectionHeading`, SVG `ServiceFallback`s; footer services column now generated from data
- **Debugging / decisions:**
  - Next 16 docs checked: classic `revalidate`/`dynamicParams` model applies (Cache Components not enabled).
  - Custom drag-rotate instead of Drei OrbitControls — OrbitControls binds to the shared canvas / connected element and would hijack events for every View.
  - Hero variant scale tuned separately from tiles after screenshots showed undersized hero visuals.
- **What I manually changed:** TODO (me)
- **Why this tool:** Large, consistent multi-file generation with typecheck/lint/build + real-GPU screenshot verification in the loop.

### 5. Portfolio + case-study architecture + 3D device showcase
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Data → CaseStudyTemplate → 10 case studies, filterable listing, and an interactive 3D case-study presentation.
- **Prompt:** "yes" (approving the proposed Step 5 plan)
- **What was generated:**
  - `Project` type, `data/projects.ts` (10 clients from the brief), data-layer functions (`getProjects`, `getProject`, `getProjectsBySlugs`, `getFeaturedProjects`)
  - `/portfolio` with `PortfolioExplorer` (industry chips × service select, Motion `layout` + `AnimatePresence` reflow), `ProjectCard`, `/portfolio/[slug]` + `CaseStudyTemplate` (client, industry, challenge, solution, deliverables, technologies, results, visuals, related services, next project)
  - `DeviceShowcase` 3D scene (phone/laptop from primitives; generated `CanvasTexture` screens that auto-crossfade; tap to switch; drag-rotate with inertia that eases back to face the viewer)
  - `useDragRotate` hook extracted from ModelingScene and reused (tap detection + spin/sway idle modes)
  - `ScreenMock` (CSS-generated project screens) — no scraped or stock images
  - Home "Selected work" section; service pages' "Related work" now resolved from `relatedProjects`
- **Judgement calls:**
  - Removed AI-written testimonials attributed to real clients — quotes must be real and approved. Results figures are explicitly marked illustrative in the data file.
  - Generated visuals instead of scraping the clients' sites (copyright, consistency, zero image weight).
- **What I manually changed:** TODO (me)
- **Why this tool:** Refactoring shared logic (drag hook) across scenes and verifying interactions (filter counts, tap/drag) programmatically.

### 6. Backend (Express + MongoDB) + contact & consultation forms
> **Note:** this Express server was later merged into the Next.js app as Route Handlers (see step 12). The layers and contract described here carried over unchanged.
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Production-style API with validation, security and lead storage; working forms on /contact.
- **Prompt:** "yes" (approving the proposed Step 6 plan)
- **What was generated:**
  - `backend/`: Express 5 + Mongoose 9, layered `routes → controllers → services → models`; zod-validated env; standard response shape `{ success, message, data?, errors? }`; central error handler (Mongoose/JSON/CORS/413 mapping, no stack in prod); helmet, CORS allow-list, global + form rate limiters, honeypot; `ContactEnquiry`, `ConsultationRequest`, `Service`, `Project` models; fire-and-forget nodemailer notifications (escaped HTML); idempotent seed from JSON exported by the frontend (`npm run export:content`)
  - Frontend: Next rewrite `/api/* → backend`, `apiClient` (45s timeout for cold starts, field-error mapping, warm-up ping), zod schemas mirroring the server, accessible `Field/Input/Select/Textarea`, honeypot, `ContactForm` + `ConsultationForm` (react-hook-form), `/contact` page with `?service=` pre-selection
- **Verified:** curl matrix (valid/invalid/honeypot/malformed JSON/404/CORS/429); DB check that injected `status` is stripped and input is trimmed/lower-cased; Playwright E2E browser → Next proxy → Express → MongoDB (201); "no rebuild" proof — a service inserted only into MongoDB rendered at `/services/cybersecurity` (200) on a build that never knew it.
- **Bugs found & fixed:** en-dash slot values broke over shell encoding → ASCII slots; the proxy forwards the browser `Origin` → CORS allow-list must include the frontend domain (deployment note); mobile overflow from grid `min-width:auto` + an unbreakable email → `min-w-0` + `overflow-wrap:anywhere`; hash links (`/contact#consultation`) were overridden by the route-change scroll-to-top → Lenis scrolls to the hash target.
- **What I manually changed:** TODO (me)
- **Why this tool:** Could read the new major versions' types (Express 5, Mongoose 9, Zod 4, rate-limit 8, dotenv 18) and verify every path end-to-end.

### 7. Business Health Checkup + Software Project Planning Guide (lead magnet)
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Two lead-generation experiences that give visitors real value in exchange for their details.
- **Prompt:** "yes" (approving the proposed Step 7 plan)
- **What was generated:**
  - `data/healthCheckup.ts`: the questionnaire as data (5 steps, 17 questions, option scores, areas, service recommendations) — exported to the backend, which builds its Zod validation and scoring from the same config
  - Backend: `healthCheckup.service.js` (config-driven validation, 0–100 area scoring, weighted recommendations), `HealthCheckupLead` + `LeadMagnetLead` models, `POST /api/health-checkup`, `POST /api/lead-magnet`
  - Frontend: `HealthCheckup` (one react-hook-form across 6 steps, per-step `trigger`, Motion direction-aware transitions, focus management, sessionStorage resume that never stores personal data, review & edit, consent), `QuestionField` (renders any question type as accessible radio/checkbox cards), `CheckupResults` (Motion score ring + count-up + area bars + recommendations), `LeadMagnetForm`, `GuideCover` (CSS-3D book tilting with Motion springs)
  - The guide itself: 6-page A4 PDF authored as HTML (`frontend/content/guides/`) and rendered with headless Chromium → `public/downloads/`
- **Bug found & fixed (via E2E test):** after a failed step check, fixing the answers and clicking "Next" once did nothing. Cause: the stale error disappeared on blur at mousedown, shifting the button 28px before mouseup so the click missed. Fix: clear a field's error as soon as its value changes.
- **Verified:** full E2E — validation, reload-resume, max-3 selection, submit (201, server score + recommendations), storage cleared, guide download (200, application/pdf).
- **What I manually changed:** TODO (me)
- **Why this tool:** Designing a config-driven architecture across frontend + backend and catching a subtle interaction bug with automated browser tests.

### 8. Technology ecosystem constellation, Why Riyadvi, lead CTAs, About
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Complete the homepage spec and the About page.
- **Prompt:** "yes" (approving the proposed Step 8 plan)
- **What was generated:**
  - `data/technologies.ts`, `data/company.ts` (story, vision, mission, values, milestones; `recognition` intentionally empty) + data-layer accessors; `lib/stats.ts` (figures derived from content, never hand-typed)
  - `TechConstellation` 3D scene: core + 3 tilted orbit rings (experience / engine / reach), per-ring speeds, hovered ring eases to a stop, drag-rotate with inertia; nodes projected to screen every frame to position real DOM labels via a tiny mutable bridge (`three/state/constellation.ts`)
  - `TechEcosystem` section: floating labels, Motion tooltip, accessible legend (hover/focus drives the 3D), sr-only live region, SVG fallback
  - `Timeline` (GSAP ScrollTrigger: scrubbed progress line, 3D swing-in cards, parallax outline years, dots that light up; Motion hover) and `JourneyFlow` (Motion staggered nodes + drawing connectors)
  - Home: `WhyRiyadvi` (stats, Since 2021 timeline, Health Checkup explainer, end-to-end journey), `LeadCtas`; `/about` page
- **Decisions:** DOM labels instead of Drei `<Html>` (Html positions against the whole canvas, which is wrong inside a View; DOM labels are crisp and accessible). Back-facing labels hidden on narrow screens to avoid clutter. No invented awards — the recognition section renders only when real entries exist; milestone copy flagged as sample.
- **Debugging:** React Compiler lint rejected mutating an imported module object from a component → mutation moved behind `setHovered()` in the bridge module. Constellation framing tuned from screenshots (camera distance, fit, initial tilt).
- **What I manually changed:** TODO (me)
- **Why this tool:** Coordinating a 3D scene with DOM UI through a no-re-render bridge, verified on a real GPU and mobile emulation.

### 9. Blog + Careers + job applications with resume upload
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Scalable blog and careers architecture with a real application pipeline.
- **Prompt:** "yes" (approving the proposed Step 9 plan)
- **What was generated:**
  - `Post` (structured `PostBlock` body — CMS/Portable-Text style, XSS-safe rendering) and `Job` types; 5 posts, 4 roles; data layer (`getPosts`, `getPost`, `getRelatedPosts` by tag/category score, `readingMinutes`, `getJobs`, `getJob`)
  - `/blog` (featured article, Motion-animated grid with category/tag filters and deferred search), `/blog/[slug]` (`BlogPostTemplate`, related articles, BlogPosting JSON-LD), generated cover art
  - `/careers` (department / designation / experience filters — half-open range overlap), `/careers/[slug]` (`JobTemplate`, JobPosting JSON-LD), `JobApplicationForm` (multipart via `postForm`)
  - Backend: `Post`, `Job`, `CareerApplication` models; `GET /api/posts|jobs`; `POST /api/applications` = rate limit → multer (memory, 5 MB, 1 file, MIME + extension) → **magic-byte sniffing** → honeypot → zod → service (job must exist & be open → GridFS → save; resume deleted if the save fails)
- **Verified:** curl attack matrix (renamed text-as-PDF, 6 MB, .txt, unknown job, missing file — all rejected, no orphan files); E2E browser upload through the Next proxy → GridFS; blog/careers filter counts.
- **Bugs found & fixed:** experience filter counted touching ranges (a 1–3 yr role matched "Fresher 0–1") → half-open overlap; `experienceLabel` exported from a `"use client"` module would have been a client reference in a Server Component → moved to `lib/format.ts`.
- **What I manually changed:** TODO (me)
- **Why this tool:** Security-sensitive upload handling designed and attacked with concrete test cases in the same session.

### 10. Admin dashboard
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Protected dashboard to view and manage every lead type.
- **Prompt:** "yes" (approving the proposed Step 10 plan)
- **What was generated:**
  - Backend: env-based single admin (bcrypt hash, `npm run hash-password`), JWT (HS256 pinned) in an httpOnly SameSite=Lax cookie, login rate limit, constant-time email compare + same error for wrong email/password; `/api/admin` routes — `me`, `stats` (total/new/this-week per type), generic paginated/searchable lists for 5 lead types (regex-escaped search), `PATCH /:collection/:id/status` (JSON-only CSRF guard, status whitelists), authenticated resume streaming from GridFS (`attachment`, `nosniff`, `no-store`)
  - Frontend: `/admin/login`; `(dashboard)` route group whose layout verifies the session on the SERVER (redirect before any protected HTML); `adminFetch` forwards the httpOnly cookie to Express; generic `DataTable` (columns as render functions), `StatusSelect` (optimistic update + `router.refresh()`), `TableToolbar` (URL-synced search/filter, debounced), dashboard + 5 table pages; noindex
- **Verified:** curl matrix (no session, wrong creds, forged `alg:none` token, invalid status, form-encoded PATCH → 415, regex-injection search, resume with/without session, logout) and full browser E2E.
- **Bug found & fixed (via E2E):** cookie `path=/api` meant the browser never sent it on `/admin/*` page requests, so the server-side guard redirected straight back to login after a successful sign-in → path `/`.
- **What I manually changed:** TODO (me) — set my own admin email/password hash and JWT secret.
- **Why this tool:** Security-focused implementation verified against concrete attack cases.

### 11. Performance, mobile & accessibility pass
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Measure first, then fix: bundle, 3D start-up cost, HTML weight, SEO assets, accessibility.
- **Prompt:** "yes" (approving the proposed Step 11 plan)
- **Measured → changed:**
  - Lighthouse showed mobile TBT 7.8 s on home while /contact (more JS) had 280 ms → not bundle size. Diagnosis (Lighthouse bootup-time + long-task attribution + CDP-attached probe): 3D was running where the GPU was emulated or the renderer name masked.
  - **GPU micro-benchmark** in the tier probe (512² fragment workload, `readPixels` sync): tuned from data — real GPU 3.3 ms vs SwiftShader 33.8 ms → thresholds 9/20 ms. Plus `failIfMajorPerformanceCaveat`.
  - **FrameGuard**: measures real frames (skipping shader-compile frames via `gl.info.programs`) and switches the session to fallbacks if the device can't hold ~20 fps. An early version false-positived on a good GPU — caught by testing on real hardware, fixed.
  - **3D starts after load + idle** (`requestIdleCallback`; +1.5 s on touch devices) so hydration and first interactions never compete with it.
  - **A/B attribution** (Pixel 7 emulation, real 4× CPU throttle, median of 3): 3D start-up added ~2.2 s blocking; dropping the per-scene Lightformer env-map on the medium tier cut ~0.7 s (home 3.0 → 2.3 s; service page 2.6 → 1.9 s). Remaining cost = parsing the 3D bundle + shader compiles, an inherent price of real-time 3D; low-end devices never pay it.
  - **Fallback SVGs as bucketed paths** (`M x y h0` + round caps): home HTML 582 → 228 KB raw (74 → 43 KB gz), SVG nodes ~2,175 → ~100 (they were also serialized into the RSC payload and hydrated).
  - **Bundle**: GSAP loaded dynamically in LenisProvider (−43 KB gz on pages without scroll animations), Motion via `LazyMotion` + `m` (strict) with async `domMax`; e.g. /services 276 → 237 KB gz initial JS.
  - **SEO/brand**: `sitemap.ts` (34 URLs from the data layer), `robots.ts` (blocks /admin, /api), generated `opengraph-image`, brand `icon.svg`, branded `error.tsx`.
  - **Accessibility**: axe-core over 12 pages × 2 viewports → fixed `region` (WhatsApp button landmark) and `heading-order` (sr-only h2s) → **0 violations**; first Tab = "Skip to content". Reduced-motion story layout fixed (`self-start` for sticky).
- **What I manually changed:** TODO (me)
- **Why this tool:** Turned profiling data into targeted fixes and verified each one with A/B measurements instead of guesses.

### 12. Merge the backend into the Next.js app (single full-stack app)
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Remove the separate Express deployment: one Next.js app serves the pages and the REST API.
  Triggered by the separate API crashing on Vercel (`FUNCTION_INVOCATION_FAILED` — Express's
  `app.listen()` server isn't a serverless function).
- **Prompt:** "I don't want separate backend and frontend. I need to implement inside the frontend backend also. deep plan and do that no need to push the code"
- **What was generated:**
  - `src/server/` — the Express layers ported to TypeScript: `config` (lazy Zod env, cached serverless Mongo connection), `models` (hot-reload-safe `defineModel`), `validators`, `services` (unchanged business logic), `utils` (`route()` wrapper = rate limit + DB + central error mapper, `formRoute()`, in-memory rate limiter, multipart resume parser with magic-byte checks, admin guard + same-origin check)
  - 21 Route Handlers in `src/app/api/**` with the same URLs and response shape → no client component changed
  - Admin pages and `lib/content.ts` call services directly (no HTTP hop); content cached with `unstable_cache` (ISR 60 s)
  - Health-checkup engine imports `src/data/healthCheckup.ts` directly (the exported JSON copy and `export:content` are gone)
  - Seeders moved to `frontend/scripts` (`tsx`, env loaded with `@next/env` like `next dev`)
  - Security headers in `next.config.ts` (replaces helmet); proxy rewrite, `BACKEND_URL`, CORS and `render.yaml` removed; `/backend` deleted
- **Verified:** `tsc`, ESLint and `next build` clean; production server E2E against Atlas — all 5 forms (201), validation (400 per field), honeypot, malformed/non-JSON bodies, form rate limit (429), PDF upload + fake PDF + .exe rejection, admin login/wrong password, me, stats, search, unknown collection (404), status PATCH + invalid status + cross-origin (403), resume download byte-identical, logout, admin pages render + redirect when signed out or with a forged cookie, DB-only service page rendered without rebuild. Test records deleted afterwards.
- **What I manually changed:** TODO (me)
- **Why this tool:** Large refactor done as a careful port (same API contract) and verified end to end, so the UI needed zero changes.

### 13. Animated text (client feedback round 2)
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Client said the site "feels like a conventional corporate website" and asked for animated text. Audited the site against the feedback, then started fixing the gaps, beginning with kinetic typography.
- **Prompt:** "in this image everything having on my project if not there means tell me that what are not having" (+ screenshots of the client feedback)
- **What was generated:**
  - `components/ui/SplitText.tsx`: masked word-by-word reveal. `trigger="load"` is pure CSS, so it runs before hydration and doesn't delay LCP. `trigger="view"` waits for an IntersectionObserver.
  - `split-word` / `split-inner` / `split-rise` CSS in `styles/globals.css` (transform-only, reduced motion shows the text instantly), plus a `<noscript>` fallback in `app/layout.tsx`
  - Hero h1 and every string `SectionHeading` title (38 usages) now animate
- **What I manually changed:** TODO (me)
- **Why this tool:** Fast gap audit across the whole codebase, then a small, reusable change that upgrades every heading at once.

### 14. Route page transitions (+ animated headings on the homepage)
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Client asked for "engaging page transitions". Every public route now enters with a cinematic gold-edged wipe.
- **Prompt:** "yes" (approving the proposed next step: page transitions via `app/(site)/template.tsx`)
- **What was generated:**
  - `app/(site)/template.tsx`: re-mounts per navigation. A black panel with a glowing gold edge slides up (portaled to `<body>` so it covers the navbar), and the content fades and rises in behind it. Skipped on the first load (protects LCP) and under reduced motion.
  - `SectionHeading` gained a `titleId` prop, so homepage titles can stay plain strings (and animate) while keeping `aria-labelledby`. `SplitText` also added to the StoryScroller and LeadCtas headings (homepage: 9 → 53 animated words).
- **Verified:** tsc, eslint and build clean. The production HTML wraps first-load content in `opacity:1;transform:none` (no hidden LCP).
- **What I manually changed:** TODO (me)
- **Why this tool:** It caught the stacking-context trap (`main` is `z-10`) and the first-load LCP risk before they shipped.

### 15. Scroll-reactive 3D, micro-interactions, portfolio previews, article/job polish, docs
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Finish the client-feedback plan: every 3D scene reacts to scroll, plus desktop micro-interactions, interactive portfolio previews, interactive blog/job pages, and documenting the design resources.
- **Prompt:** "no need to ask the question complete all the phases one by one"
- **What was generated:**
  - `viewProgress` ref in `SceneView` → `SceneProps`: the box's position in the viewport (−1…1), measured on scroll only while active. Used by `ServiceScene` (turn + parallax; the hero opens up on scroll; touch tiles engage when centred), `TechConstellation` (tip + turn) and `DeviceShowcase` (swings to face you)
  - `components/layout/PointerFX.tsx`: magnetic buttons (`data-magnetic`), tilt cards (`data-tilt`) and a cursor ring from one delegated listener; desktop + no reduced motion only
  - `ProjectCard`: CSS-3D tilt + glare and a hover fan of extra screens; `showcase` added to all 10 projects
  - Blog: `ReadingProgress`, `ArticleToc` (IntersectionObserver + Motion `layoutId`), heading anchors, reveals. Careers: `HiringSteps` (self-drawing track) and reveals in `JobTemplate`
  - README: motion section, updated 3D table, "Design resources explored" (getlayers.ai, threeui.com, reviewed as references, nothing copied)
- **Verified:** tsc and eslint clean (3 older warnings); all key routes return 200 from the dev server and render the new markup. The production build was blocked by the running dev server's lock on `.next`, so re-run `npm run build` with the dev server stopped.
- **What I manually changed:** TODO (me)
- **Why this tool:** One consistent pattern (refs + delegated listeners, CSS where it suffices) applied across many files, with no new dependencies.

### 16. Brief v2: premium redesign pass (taste-skill, display type, hero, new sections, newsletter)
- **AI Tool:** Claude Code (Claude Opus), plus the taste-skill design skills (`npx skills add Leonxlnx/taste-skill`)
- **Purpose:** The client's second brief asked for a premium, original, interactive site that doesn't read as a template, with an honest report.
- **Prompt:** the pasted 11-phase brief ("Act as a senior creative developer... PHASE 1: AUDIT ... PHASE 11: DOCUMENTATION"), plus "no need to push the code"
- **What was generated:**
  - **Skills:** taste-skill installed (3 skills in `.claude/skills/`, `skills-lock.json`). All files were read before use, and their rules applied (see TOOLS.md).
  - **Design system:** Space Grotesk display font, fluid `text-display-*` scale, radius/shadow/section tokens, `tabular` utility, film-grain layer. Section labels on the homepage cut from 7 to 3. Em-dashes removed from all visible copy.
  - **Hero:** time-based entrance, shader particles (`Particles.tsx`), blob contact shadow (`GroundShadow.tsx`; drei ContactShadows rejected because of the extra render pass), translucent glass shell. Scroll cue removed.
  - **Homepage:**
    - `Capabilities` / `CapabilityStack` (CSS-3D layer diagram)
    - zig-zag services with a feature reveal
    - Simple Icons logos (`TechLogo`)
    - `ProjectCarousel`
    - `CountUp` stats
    - `CapabilityMarquee` (GSAP velocity)
    - `ContactClose` with a spotlight and a lazily loaded form
    - `HideOnRoutes` for the footer CTA
    - `Preloader`
  - **Backend:** newsletter model, validator, idempotent service, `/api/newsletter`, footer form, admin page, sidebar and stat card.
  - **Docs:** `TOOLS.md`, README sections.
- **Verified:**
  - `tsc` and ESLint clean, and `next build` succeeds (63 pages).
  - A crawl of 35 linked pages and all 34 sitemap URLs found no broken links.
  - Newsletter API live: 201, 200 on repeat, 400 on invalid input, honeypot submissions not stored, unique index present. Test row deleted.
  - Playwright (Chromium) on 13 pages at 360, 768 and 1440 px: no console errors, no horizontal overflow (after fixing a 34 px overflow from the 3D stack).
  - Preloader first-visit and later-visit behaviour, reduced motion, keyboard focus order and outlines, capability, carousel and service-hover interactions.
  - Lighthouse A/B against the previous commit. This found an LCP regression and DOM/JS growth, which were fixed; the remaining gap is documented in the README.
- **Not verified:** the 3D on a real GPU (headless runs software WebGL); Lighthouse on the deployed site.
- **What I manually changed:** TODO (me)
- **Why this tool:** It could audit, implement, test in a real browser and measure performance against a baseline in one loop, and it reported a regression it had introduced instead of hiding it.

### 17. New display font, new hero concept, scroll-driven case studies
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** Client/developer feedback on the redesign: a different heading font, a different hero 3D effect, and case studies that move right to left while scrolling.
- **Prompt:** "change this fornt and change this 3D effect different" (answers: Syne, hero), then "i need scrolling effect when track that it need move right to left"
- **What was generated:**
  - Font: Syne (600/700) replaces Space Grotesk via `next/font`; display scale re-tuned for its width.
  - Hero: `three/scenes/hero/GrowthGrid.tsx`, a "growth landscape" of instanced columns (entrance wave, pointer ripple via an invisible hit plane, scroll steepening, height-based colour). It uses `three/utils/growthGrid.ts`, a layout shared with the rewritten isometric `HeroFallback`. The old sphere/network files were removed.
  - `ProjectCarousel`: `gsap.matchMedia` pin + scrub pan on ≥768px (motion allowed); keyboard focus scrolls the page to the focused card; native carousel otherwise.
- **Verified:** tsc and ESLint clean, `next build`. In Playwright on the production build:
  - The 3D canvas renders, the hover ripple is visible, and the no-WebGL fallback shows the same skyline.
  - The pan moves the track from 0 to −1287px, 1px per px of scroll, while pinned, then releases.
  - Mobile keeps the swipe carousel with no overflow. No page errors.
- **What I manually changed:** TODO (me)
- **Why this tool:** Fast iteration with real screenshots of each change (rest, hover, scroll, fallback) instead of guessing how the 3D looks.

### 18. Capabilities: CSS planes → premium WebGL layer stack
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** The flat CSS-3D layer diagram didn't feel premium enough.
- **Prompt:** "chnage this effect i need in premiem i need better 3D effect" (+ screenshot of the capabilities section)
- **What was generated:**
  - `three/scenes/capabilities/CapabilityScene.tsx`: clearcoat slabs (drei RoundedBox), canvas-texture engravings redrawn once the Syne font loads, rounded-rect gold rims, corner pillars, and rising points in a shader. Scroll assembles the stack via `viewProgress`, with pointer tilt and an idle float.
  - `three/state/capabilities.ts`: a two-way bridge between the list and the 3D scene, with no per-frame React renders.
  - The CSS stack became the `SceneView` fallback.
  - Also fixed: the footer column overflowed by 8px at 390px (`min-w-0`, `w-0` on the newsletter input, breakable email).
- **Verified:** tsc and ESLint clean, `next build`. In Playwright: the canvas renders at desktop and mobile; hovering "Engineering" lifts that slab and syncs the list; no horizontal overflow; no errors.
- **What I manually changed:** TODO (me)
- **Why this tool:** Iterated using real screenshots (assembled, selected, entering) and caught the pillar length and a mobile overflow before shipping.

### 19. Technology section: orbit constellation → technology globe
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** The orbit constellation's floating labels overlapped, and the rings flattened when tilted.
- **Prompt:** "change this" (+ screenshot of the technology section)
- **What was generated:**
  - `three/scenes/tech/TechGlobe.tsx`: logo tiles (canvas textures drawn from Simple Icons paths) on a Fibonacci sphere. Tiles face the viewer (drei Billboard) and use depth fade/scale, with a single LineSegments for the spokes, a gold core and a faint wire shell. Drag, spin and scroll tilt reuse `useDragRotate`.
  - `lib/techIcons.ts`: one icon source for DOM and 3D.
  - `constellation` state is now a two-way bridge (`hovered` + `onHover`). The floating DOM labels were removed.
  - Static fallback: a ring of logo tiles. The old `TechConstellation.tsx` was deleted.
- **Verified:** tsc and ESLint clean. In Playwright on the dev server: the canvas renders on desktop and mobile with no overflow and no errors. Legend hover pops the MongoDB tile and shows its card; hovering a tile in the globe shows its card (Node.js).
- **Not verified:** `next build` was blocked by a locked file under `.next` (the dev server or OneDrive). Re-run with the dev server stopped.
- **What I manually changed:** TODO (me)
- **Why this tool:** Diagnosed the label overlap from a screenshot, replaced the concept rather than patching it, and checked both hover directions automatically.

### 20. Case studies: flat carousel → 3D coverflow ring
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** The developer liked the hero's 3D quality and wanted the case-study carousel in the same premium 3D style.
- **Prompt:** "much better i need premium look carousel like that 3D format" (answer: the case-study carousel)
- **What was generated:**
  - `three/scenes/work/WorkRing.tsx`: gold-framed screens (generated CanvasTextures plus a clearcoat glass sheen) on a ring. The ring snaps to the nearest project with a damped glide. Side screens are counter-rotated (coverflow), far-side panels hidden, and the front screen is clickable.
  - `three/state/work.ts`: progress and the onOpen bridge.
  - `components/portfolio/WorkStage.tsx`: ScrollTrigger pin and progress, an animated caption, accessible dot navigation through Lenis, and the flat card as the no-WebGL fallback.
  - `WorkShowcase.tsx`: `useSyncExternalStore` + matchMedia chooses the stage or the swipe carousel. `ProjectCarousel` is back to swipe-only.
- **Verified:** tsc and ESLint clean. In Playwright on the dev server:
  - Scrolling walks through all 6 projects in order, with the caption in sync.
  - Dot 4 jumps to Puratap, and clicking the front screen navigates to /portfolio/puratap.
  - Mobile keeps the swipe carousel with no overflow. No errors. Screenshots were checked for centring and clipping (the camera was re-framed after the first pass).
- **Not verified:** `next build` (blocked by a locked `.next` file while the dev server runs).
- **What I manually changed:** TODO (me)
- **Why this tool:** Rapid screenshot-driven iteration: the first version stopped between projects and showed back panels; snapping, culling and camera framing were fixed from what the screenshots showed.

### 21. Hero: growth landscape → liquid gold core
- **AI Tool:** Claude Code (Claude Opus)
- **Purpose:** The developer wanted a more premium hero. They chose "Liquid gold core" from four proposed concepts.
- **Prompt:** "change this also" (+ hero screenshot), then the concept choice.
- **What was generated:**
  - `three/scenes/hero/LiquidCore.tsx`: a high-segment sphere with MeshPhysicalMaterial (clearcoat, slight warm emissive so it never mirrors pure black). `onBeforeCompile` injects Ashima simplex noise (MIT) for radial displacement plus a cursor bulge, and rebuilds normals from neighbouring displaced points. Module-level uniforms are updated in useFrame. It also has a fresnel halo, two orbit rings with glints, `Particles` and `GroundShadow`.
  - New static `HeroFallback` (SVG sphere + rings). `GrowthGrid` and `growthGrid.ts` were removed.
- **Verified:** tsc and ESLint clean. In Playwright on the dev server: the canvas renders on desktop and mobile with no errors, the cursor bulge is visible, and the no-WebGL fallback renders. The first pass looked like dark crumpled foil; it was retuned (smoother noise, roughness 0.24, envMapIntensity, emissive, thinner halo) after reviewing the screenshots.
- **Not verified:** `next build` (blocked by a locked `.next` file while the dev server runs).
- **What I manually changed:** TODO (me)
- **Why this tool:** Wrote a custom shader patch quickly and iterated on the material from real screenshots.

### 22. Premium pass on the liquid core; cursor ring removed
- **AI Tool:** Claude Code (Claude Opus)
- **Prompt:** "much better i need it should be look preimum", then "i no need crusher" (screenshot of the cursor ring)
- **What was generated:**
  - LiquidCore: its own jewellery-studio Environment on the high tier (softbox, two strip lights, gold rim ring, warm floor bounce, and a front fill so the centre doesn't mirror black).
  - Brighter gold (#f0c766), roughness 0.17, subtle iridescence, lower emissive.
  - The fresnel "bubble" replaced by an additive aura sprite; finer rings with sprite-glow glints. A clipped third ring was removed.
  - `PointerFX` no longer renders the cursor ring (magnetic buttons, card tilt and spotlight stay); its CSS was removed.
- **Verified:** tsc and ESLint clean. Playwright screenshots on the dev server: no errors, and 0 `.cursor-ring` elements.
- **What I manually changed:** TODO (me)

### 23. Hero: floating devices (liquid core kept as an alternative)
- **AI Tool:** Claude Code (Claude Opus)
- **Prompt:** "implement any other 3D image and change a image above i given need in different format"
- **What was generated:**
  - `three/scenes/hero/FloatingDevices.tsx`: laptop, tablet and phone built from primitives (RoundedBox), titanium-black clearcoat bodies with gold trim. Screens use featured projects' screen textures with a crossfade. Entrance rise, idle float, layered pointer parallax, hover focus via invisible hit boxes, scroll fan-out, and a smaller arrangement on narrow boxes.
  - `three/scenes/shared/GoldStudio.tsx`: the Lightformer studio, shared with `LiquidCore`.
  - The Hero (now async) passes three featured projects' screens to the scene. New SVG fallback.
  - `LiquidCore` was kept unregistered as an alternative, because it was never committed and deleting it would lose the work.
- **Verified:** tsc and ESLint clean. Playwright screenshots on the dev server (rest, hover, mobile after scroll, no-WebGL fallback), no errors. The layout was iterated twice from screenshots: tablet/laptop overlap, then mobile edge clipping.
- **What I manually changed:** TODO (me)

### 24. Hero restyled after a reference (Draftly "Asme" preset)
- **AI Tool:** Claude Code (Claude Opus)
- **Prompt:** "https://www.draftly.space/presets/asme use this link and change like 3D format i need this like"
- **Research:** the preset page is client-rendered, so its preview (`/preset-sites/asme/`) was opened in headless Chromium and screenshotted. It is NOT 3D: it uses full-bleed AI-generated videos (a person at a desk inside swirling light streaks) with a centred serif headline and a glass pill nav. Its videos are third-party assets and were not used.
- **What was generated:**
  - The same look rebuilt in real-time WebGL in the Riyadvi palette. `Hero.tsx` is now a full-bleed stage with centred copy and a readability vignette.
  - `three/scenes/hero/LightVortex.tsx`: shader-driven orbit bands with 12 trail copies per particle, so points read as continuous light streaks; scroll increases speed.
  - `FloatingDevices` gained an aspect-aware stage layout (fit, position, swirl scale for wide desktops and tall phones).
- **Verified:** tsc and ESLint clean. Playwright screenshots on the dev server, desktop 1440 and mobile 390 (no overflow, no errors). Iterated 3 times from screenshots: devices behind the CTAs, dotted dust that read as stars rather than streaks, and rings facing the camera instead of orbiting.
- **What I manually changed:** TODO (me)

### 25. Hero: flowing gold tubes (after the Draftly "Power AI" preset)
- **AI Tool:** Claude Code (Claude Opus)
- **Prompt:** "https://www.draftly.space/presets/power-ai in center 3D image change that and from the like i need"
- **Research:** the preview (`/preset-sites/power-ai/`) was screenshotted in headless Chromium. It is a full-bleed VIDEO of glossy purple tubes behind a huge centred gradient headline (no WebGL). The video was not used.
- **What was generated:**
  - `three/scenes/hero/FlowTubes.tsx`: seeded CatmullRom curves → TubeGeometry, satin MeshPhysicalMaterial (clearcoat + gold sheen), vertex-shader undulation via `onBeforeCompile` with a module-level time uniform, draw-range "grow" entrance, camera-relative fog, pointer parallax, scroll dolly.
  - Hero copy is now vertically centred over a centred vignette, with a bottom fade (this fixed the hard cut line in the developer's screenshot).
  - New SVG fallback (stroked gold curves). Previous heroes kept as registry alternatives.
- **Verified:** tsc and ESLint clean. Playwright desktop and mobile screenshots on the dev server, no errors, no overflow. Iterated from screenshots: fewer and deeper tubes to calm the centre, and fog distance tied to the camera so phones keep the tubes visible.
- **What I manually changed:** TODO (me)

### 26. Case studies: coverflow → product-launch spotlight carousel
- **AI Tool:** Claude Code (Claude Opus)
- **Prompt:** "in this image i need to change like 2nd image like that scorlling i need" (+ a reference video frame of an energy-drink site with leaning cans in a row and a spotlit centre can)
- **What was generated:** `WorkRing` rewritten. Phones (titanium + gold trim, the projects' mobile screens) sit on an arc with a shared lean; the spotlit phone stands upright, steps forward and grows; there is a rotating emissive halo torus and a podium with a gold rim ring, plus `GoldStudio` lighting. `WorkStage` now passes each project's mobile screen. Scroll, dots and click behaviour are unchanged.
- **Verified:** tsc and ESLint clean. Playwright on the dev server: all 6 projects come into the spotlight in order, dot jump works, clicking opens /portfolio/puratap, mobile carousel works with no overflow, no errors. Camera re-framed after the first screenshot (halo and podium were cropped).
- **What I manually changed:** TODO (me)

### 27. Page transition: gold wipe → soft settle
- **Prompt:** "when i click any page one golden line going top i no need that change any animation like that"
- **Change:** `app/(site)/template.tsx` no longer portals a black panel with a gold edge. The page now fades in from opacity 0, scale 0.985, y 14px over 0.6 s. A blur was deliberately avoided, because a filter would become the containing block for fixed children.
- **Verified:** tsc and ESLint clean. In Playwright, navigating Home → About: opacity 0 → 0.77 → 0.94 → 1 within ~300 ms, and no z-70 overlay element.
- **What I manually changed:** TODO (me)

### 28. Final check against the client's feedback
- **Prompt:** "they have send this i to implement that and i have implement if any that is not implement implement that" (+ screenshots of the client message)
- **Audit:** every point in the message is implemented in code. The gaps were verification and documentation.
- **Done:**
  - Production build verified on a temporary copy of `frontend/` (the dev server locks `.next`): 63 pages, no errors.
  - A crawl of 35 pages found no broken links.
  - Playwright on 13 pages at 360/768/1440 px: no console errors, no overflow.
  - Preloader, reduced motion, keyboard and interactions checked; the case-study carousel tested end to end.
  - Lighthouse: mobile 45 / desktop 69 performance; accessibility 100 after enlarging the case-study dot targets; best practices 100; SEO 100.
  - Docs updated: README (7 WebGL experiences, Draftly and reel references, latest Lighthouse), TOOLS.md resources, WALKTHROUGH 3D section rewritten for the current hero, capabilities, case-study carousel and tech globe.
- **What I manually changed:** TODO (me)
