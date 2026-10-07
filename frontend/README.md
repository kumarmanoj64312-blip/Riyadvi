# Riyadvi — Website + API

Next.js 16 (App Router) + TypeScript + Tailwind v4 + R3F/Drei + GSAP/ScrollTrigger + Lenis + Motion,
with the REST API as Route Handlers (`src/app/api`) over Mongoose (`src/server`).

```bash
cp .env.example .env   # MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET …
npm install
npm run seed       # content + admin account (idempotent); seed:admin, seed:demo also available
npm run dev        # http://localhost:3000 · /api/health · /admin/login
npm run build      # production build (Turbopack)
```

See the root [README](../README.md) and [docs/](../docs) for architecture, 3D strategy and the AI usage log.

## Lead magnet PDF

The guide at `public/downloads/riyadvi-software-project-planning-guide.pdf` is generated from
`content/guides/software-project-planning-guide.html` (print CSS, A4). To regenerate, open the HTML in
Chrome → Print → Save as PDF (A4, background graphics on), or render it with Playwright's `page.pdf()`.

## Content

`src/data/*.ts` is the single source of content: the site renders it (`CONTENT_SOURCE=local`), and
`npm run seed` upserts the same objects into MongoDB (`CONTENT_SOURCE=api`).
