# Riyadvi — Frontend

Next.js 16 (App Router) + TypeScript + Tailwind v4 + R3F/Drei + GSAP/ScrollTrigger + Lenis + Motion.

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (Turbopack)
```

See the root [README](../README.md) and [docs/](../docs) for architecture, 3D strategy and the AI usage log.

## Lead magnet PDF

The guide at `public/downloads/riyadvi-software-project-planning-guide.pdf` is generated from
`content/guides/software-project-planning-guide.html` (print CSS, A4). To regenerate, open the HTML in
Chrome → Print → Save as PDF (A4, background graphics on), or render it with Playwright's `page.pdf()`.

## Content export

`npm run export:content` writes services, projects and the health-checkup questionnaire to
`../backend/src/seed/data/*.json` (the backend seeds MongoDB and validates the checkup from them).
