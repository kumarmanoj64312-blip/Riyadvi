# Interview Walkthrough Notes (10–15 min)

Short answers I can speak to. Rewrite in my own words before the interview.

## 1. Why this design direction?
Gold-on-black is Riyadvi's brand; I pushed it toward "premium tech" with near-black layered surfaces,
frosted glass, metallic gold gradients and one signature easing curve (`cubic-bezier(0.22,1,0.36,1)`)
used by CSS, GSAP and Motion so every movement feels like the same product.
_TODO (me): add my own reasoning / references I looked at._

## 2. How was the 3D implemented?
**Architecture — one canvas for the whole site.** A single fixed, transparent R3F `<Canvas>` sits
behind the page (mounted in the `(site)` layout). Sections render a `<SceneView>`, which is just an
empty DOM box; Drei's `<View>` draws each scene into that box's rectangle of the shared canvas
(viewport + scissor). One WebGL context, shaders compiled once, survives page navigation.

**Hero "digital ecosystem"** — meaning: the business (metal core) at the centre of connected systems
(nodes + links) with data flowing between them (pulses).
- ~110 nodes on a Fibonacci sphere → one `InstancedMesh` (1 draw call). Links = k-nearest neighbours
  computed once at mount → one `LineSegments`. Nodes never move relative to each other; the group
  rotates, so nothing is recomputed per frame.
- Hover: R3F raycast gives `instanceId`; I recolour that node, its neighbours and their links by
  writing directly into the GPU colour buffers (no React state).
- Data pulses: points whose position along an edge is computed in the vertex shader from one
  `uTime` uniform.
- Core: faceted metal reflecting a procedural Lightformer environment (no HDR download), a
  counter-rotating edge shell, and a fresnel glow shader instead of bloom post-processing.
- Motion: cursor/tilt parallax, scroll → rotation + camera dolly, idle drift — all damped with
  `MathUtils.damp(…, delta)` so it's frame-rate independent.

**Transformation story** — one point cloud, six meanings: scattered fragments (challenge) → grid
(strategy/plan) → wireframe cube (design structure) → network (technology) → rising helix (launch)
→ bar chart (growth). Every point stores its position in all six formations; the vertex shader blends
the two nearest ones from a single `uProgress` uniform. GSAP ScrollTrigger pins the section, scrubs
the text timeline and writes progress into a plain object the shader reads — one source of truth,
so text and 3D can't drift apart.

**Services** — one `ServiceScene` component, six visual metaphors chosen by data (`sceneType`):
web = layers of a page exploding in depth; app = phone + orbiting screens; marketing = exponential
growth chart; AR/VR = portal; 3D modeling = object revealing its wireframe topology (drag to rotate);
UI/UX = chaos → aligned layout. All six home tiles render live in the one shared canvas — the reason
for the single-canvas architecture.

**Case study 3D** — data flag `showcase: { device }` turns any case study into an interactive
presentation: a phone or laptop built from rounded boxes showing the project's screens. The screens
are CanvasTextures drawn at runtime from the project's data (client, brand accent, screen names), so
no screenshots are downloaded; real ones can replace them via TextureLoader. Tap to switch screens,
drag to rotate (custom `useDragRotate`, because Drei OrbitControls would grab events for the whole
shared canvas).

**Technology ecosystem** — data-driven constellation: technologies orbit a core on three tilted
rings (experience, engine, reach). Hover pauses a ring; drag rotates the system. Labels are real DOM:
each frame the scene projects every node to screen space and moves its label (no `<Html>`, no React
renders). The legend under the scene is the accessible version and drives the same highlight.

**About timeline** — GSAP ScrollTrigger: scrubbed progress line, cards swinging in with a slight 3D
rotation, parallax outline years, dots lighting up as you reach them. Not WebGL on purpose — depth
from CSS 3D + parallax is enough here and costs nothing on mobile.

## 3. Which AI tools, and why?
See `docs/AI_LOG.md`.

## 4. AI-generated vs manually built?
_TODO (me) — keep updated per step._

## 5. How do frontend, backend and DB connect?
```
Browser ──fetch /api/contact──▶ Next.js (Vercel) ──rewrite──▶ Express (Render) ──Mongoose──▶ MongoDB Atlas
Next.js server ──lib/content.ts fetch (ISR 60s)──▶ Express GET /api/services|projects
```
- Browser only ever calls its own origin (`/api/*`); `next.config.ts` rewrites proxy to Express → no CORS
  for visitors, and first-party cookies for the admin login later.
- Express: `routes → middleware (rate limit → honeypot → zod validate) → controller → service → model`.
  Every response is `{ success, message, data?, errors? }`; one central error handler maps errors to
  status codes. Emails are sent after the DB save, in the background, so they can never lose a lead.
- Content: Next server components fetch from the API with ISR; if the API is down they fall back to
  bundled data. The same data seeds MongoDB (`npm run export:content` → `npm run seed`).

**Admin & security** — single admin from env (bcrypt hash), JWT in an httpOnly SameSite=Lax cookie
(never localStorage). Same-origin thanks to the `/api` rewrite, so it's a first-party cookie. Admin
pages are Server Components that verify the session before rendering — no flash, nothing to bypass
client-side. Status changes require JSON (CSRF), searches are regex-escaped, resumes stream from
GridFS only with a session.

## 6. Adding a service/project/post/job without rebuilding?
Pages never import content directly — they call `lib/content.ts` (`getServices`, `getService`…).
- With `CONTENT_SOURCE=api` the data layer fetches from the Express API with ISR
  (`next: { revalidate: 60, tags }`). A new MongoDB record shows up on the next revalidation.
- `/services/[slug]` pre-renders known slugs via `generateStaticParams`; unknown slugs are rendered on
  first request (dynamic params allowed) and then cached — no redeploy.
- The new service picks a 3D visual through its `sceneType` field (or `generic`), so even the 3D
  needs no code change.
- If the API is down, the data layer falls back to the bundled content — pages never break.
- **Proven:** a service inserted only into MongoDB rendered at `/services/cybersecurity` (HTTP 200) on
  a production build that had never seen it.

## 7. How was 3D optimized?
Foundation in place from Step 1:
- `useDeviceTier()` decides **before** any WebGL loads: high / medium / low. Low (no WebGL, software
  GPU, data-saver, ≤2 cores/≤2 GB) never downloads the 3D bundle — it gets a CSS/SVG fallback.
- The WebGL probe context is explicitly released (`WEBGL_lose_context`) so it doesn't eat into the
  browser's ~16 live-context budget.
- The tier is `null` during SSR/hydration → first paint is always the lightweight version.
- Three.js/R3F/Drei (~270 KB gz) are code-split: never in the initial bundle, only requested when a
  page has a SceneView *and* the device tier is medium/high.
- Off-screen: IntersectionObserver → the View stops drawing, scene `useFrame`s early-return
  (`activeRef`), and the canvas `frameloop` becomes `"never"` when no view is visible.
- Per-tier detail: high 110 nodes / 70 pulses, medium 64 / 32; DPR capped (1.5 / 1).
- No per-frame allocation (module-level scratch Vector3/Matrix4), no per-frame React renders
  (pointer lives in a mutable object, not state).
- Instancing: 110 nodes = 1 draw call; only nodes whose scale changes get matrix updates.
- Robustness: error boundary + `webglcontextlost` → every view falls back to its SVG.
- **Measure, don't guess:** a ~5 ms on-device GPU micro-benchmark decides the tier (real GPU 3.3 ms vs
  CPU-emulated 33.8 ms on my test machine), and a runtime FrameGuard watches real frame times and
  switches the session to fallbacks if a device can't hold ~20 fps.
- 3D starts only after load + idle, so hydration and first taps never compete with it.
- Phones skip the environment-map render (measured −0.7 s start-up on a 4× throttled CPU).
- Fallback SVGs are a handful of `<path>`s (dots as round-capped zero-length segments): home HTML
  582 → 228 KB.

## 8. Biggest technical challenges?
- Multiple 3D sections without hitting the browser's WebGL context limit → one canvas + Drei View.
  Gotcha: View maps pointer events only when the event target is its own div, so the hero text layer
  is `pointer-events: none` (buttons re-enable it) — otherwise hover would die under the text.
- Scenes rendered at the wrong scale inside Views (tiny on mobile, clipped on desktop): R3F's
  `viewport` isn't derived from a View's own camera/rect. Fixed by computing the visible area from
  FOV, camera distance and the View's pixel size.
- Admin login "worked" but bounced back to the login page: the session cookie was scoped to `/api`,
  so the browser never sent it with `/admin` page requests that the server-side guard checks.
  Found by an E2E test; fixed by scoping it to `/`.
- Mobile Lighthouse showed 7.8 s of blocking time on the home page. Bundle size wasn't it (the
  contact page shipped more JS and was fine). Attribution showed 3D running on devices where WebGL was
  CPU-emulated but the GPU name was masked → GPU micro-benchmark + FrameGuard + idle start-up.
- A swallowed click in the multi-step form: a stale validation error vanished on blur at mousedown,
  moving the "Next" button before mouseup. Found by an automated E2E test; fixed by clearing a
  field's error as soon as it changes.
- Smooth scroll + scroll-linked 3D without jitter: Lenis is driven by GSAP's ticker (one RAF loop),
  `lagSmoothing(0)`, and ScrollTrigger updates on every Lenis scroll event.
_TODO (me): add as they happen._

## 9. With 1–2 more weeks?
_TODO (me)._
