# Tools, libraries and resources

This page lists every tool, library and design resource used to build the Riyadvi website, and what each one is for. The per-step history of AI-assisted work, including the prompts used, is in [`docs/AI_LOG.md`](docs/AI_LOG.md).

## AI tools and how they were used

| Tool | What it did |
|---|---|
| **Claude Code** (Anthropic, Claude Opus), agentic coding in VS Code | Planned the architecture. Wrote most of the code in small reviewed steps. Ran the type check, lint, builds and browser tests after each step, and fixed what they found. |
| **taste-skill** (`Leonxlnx/taste-skill`, installed with `npx skills add Leonxlnx/taste-skill`) | Design guidance used by Claude Code. Three of its skills are installed in [`.claude/skills/`](.claude/skills) (`design-taste-frontend`, `redesign-existing-projects`, `high-end-visual-design`), with versions pinned in `skills-lock.json`. See "How taste-skill was applied" below. |

**Workflow:**

1. Audit the code against the brief.
2. Write a phased plan and get it approved.
3. Implement one phase at a time.
4. Verify each phase with `tsc`, ESLint, `next build`, live API calls and Playwright browser checks.
5. Log the step in `docs/AI_LOG.md`.

The developer reviews each step, and the "What I manually changed" entries in the log record their own edits.

**Measured, not assumed.** Performance claims were tested against a build of the previous commit. When Lighthouse showed the new homepage had regressed, the cause was measured (headline hidden in the reveal mask, extra JavaScript, DOM size) and fixed. The remaining gap is stated honestly in the README.

### How taste-skill was applied

| Principle from the skill | Where it shows |
|---|---|
| Typeface contrast instead of Inter everywhere | Syne display headings, with Inter kept for body text |
| At most one small label above a heading per three sections | Homepage cut from 7 such labels to 3 (hero, services, work) |
| No three identical cards in a row; vary the layout of each section | Services alternate 7/5 and 5/7 widths. Every homepage section uses a different layout. |
| No scroll cue in the hero | Removed |
| No em-dashes in visible copy | Removed from all site copy (data files, UI, metadata, API messages) |
| One accent colour; motion must have a purpose; respect reduced motion | Monochrome tech logos, a single marquee, reduced-motion paths everywhere |
| Real logos instead of text wordmarks | Simple Icons in the technology section |
| Texture instead of flat backgrounds | A fixed film-grain layer behind the content |

**Deliberately not followed:**
- **No custom cursors (skill):** followed. A cursor ring was tried and then removed at the developer's request; the native cursor is used.
- **No Inter (skill):** CLAUDE.md requires Inter as the primary font, so it stays for body text.
- **Dark and light modes (skill):** the brand is black and gold, so the site is dark only.
- **No "fake screenshots" built from divs (skill):** the portfolio uses CSS screen mockups because no approved screenshots exist yet. Real screenshots are needed.

## Libraries in `frontend/package.json`

### 3D and animation

| Package | Purpose |
|---|---|
| `three` | WebGL 3D engine |
| `@react-three/fiber` | React renderer for Three.js. All five scenes are React components. |
| `@react-three/drei` | Helpers: `View` (one shared canvas for every scene), cameras, `Environment`/`Lightformer` studio lighting, `RoundedBox` |
| `gsap` + `@gsap/react` (ScrollTrigger) | Pinned, scrubbed transformation story; About timeline; marquee that reacts to scroll velocity |
| `lenis` | Smooth scrolling, synced with ScrollTrigger and turned off for reduced motion |
| `motion` (Framer Motion, `motion/react` with `LazyMotion`) | Route transitions, reveals, capability-stack assembly, table-of-contents indicator, form states |
| `zustand` | Low-frequency 3D state (canvas mounting, WebGL lost). Per-frame input lives in plain refs. |

### UI and forms

| Package | Purpose |
|---|---|
| `next` 16 (App Router) + `react` 19 | Framework: server components, route handlers, static generation |
| `tailwindcss` 4 + `@tailwindcss/postcss` | Styling with design tokens defined in `@theme` |
| `react-hook-form` + `@hookform/resolvers` + `zod` | Contact, consultation, checkup, lead-magnet and job forms, with schemas matching the server's |
| `simple-icons` | Official technology logos (CC0 SVG paths; named imports only) |

### Backend (same Next.js app)

| Package | Purpose |
|---|---|
| `mongoose` | MongoDB models; GridFS for résumés |
| `zod` | Server-side validation of every POST |
| `jsonwebtoken` + `bcryptjs` | Admin authentication (JWT in an httpOnly cookie, hashed password) |
| `nodemailer` | Team notification emails; failures never block saving to the database |

### Tooling

`typescript`, `eslint` + `eslint-config-next`, `tsx` (seed scripts), and the `@types/*` packages.

**Not used, on purpose:**
- **Lottie and Rive:** no micro-interaction here needs designer-made animation files, so they would only add libraries and assets.
- **Spline:** procedural Three.js scenes are lighter and fully controllable.
- **Post-processing:** it doesn't work with the shared scissored canvas, and it costs too much on phones. The glow is a fresnel shader instead.

**QA tooling (not a project dependency):** Playwright was installed only in a scratch folder to drive Chromium for the browser checks. Lighthouse 12 was run through `npx`.

## Design resources and inspiration

| Resource | How it was used |
|---|---|
| [getlayers.ai](https://getlayers.ai) | Reviewed as a reference for the level of interaction expected, such as kinetic type, page transitions and interactive previews. No prompts, code or assets were copied. |
| [threeui.com](https://threeui.com) | Reviewed for patterns: product turntables, scroll-driven 3D, pointer-reactive lighting. These informed the scroll-reactive scenes and the case-study device. No code was copied. |
| taste-skill | Design rules applied as described above |
| [Draftly "Asme" preset](https://www.draftly.space/presets/asme) | Previewed in a headless browser. It is a video template; its swirling-light look was rebuilt as GPU particle streaks (`LightVortex`). No assets used. |
| [Draftly "Power AI" preset](https://www.draftly.space/presets/power-ai) | Previewed the same way. Its flowing-tubes look became the current hero (`FlowTubes`), rebuilt as real-time 3D in gold. No video used. |
| Energy-drink product site (reel shared by the developer) | The "row of leaning products with a spotlit centre" pattern became the case-study carousel (`WorkRing`). |

Their whole-page templates were not used: each runs its own WebGL context, which would break the single shared canvas and the mobile performance budget.

## Fonts and assets

- **Inter** (body) and **Syne** (headings), both under the SIL Open Font License and self-hosted with `next/font`.
- **Technology logos:** Simple Icons (CC0). The marks remain trademarks of their owners. AWS and React Three Fiber show text monograms because no official mark is available.
- **Everything else is generated:** Three.js geometry and shaders, CSS screen mockups, canvas textures and SVG. There are no stock photos or downloaded 3D models.

## Setup

See [README.md](README.md#getting-started-local). In short: `cd frontend`, copy `.env.example` to `.env`, `npm install`, `npm run seed`, then `npm run dev`.
