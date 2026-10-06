# Riyadvi — Backend API

Express 5 · MongoDB (Mongoose 9) · Zod 4 · helmet · CORS allow-list · rate limiting · nodemailer

```bash
cp .env.example .env          # set MONGODB_URI (local or Atlas) and CORS_ORIGINS
npm install
npm run seed                  # upsert services & projects (idempotent)
npm run dev                   # http://localhost:5000  (node --watch)
```

Content for the seed is exported from the frontend's typed data files:
`cd ../frontend && npm run export:content` → `src/seed/data/*.json`.

## Structure

```
src/
  server.js            connect DB → listen; graceful SIGTERM shutdown
  app.js               helmet, CORS, JSON limit, /api router, 404, error handler
  config/              env (zod-validated), db
  routes/index.js      every endpoint in one table
  middleware/          validate (zod), spamProtection (rate limits + honeypot), errorHandler
  validators/          zod schemas per endpoint
  controllers/         thin HTTP adapters
  services/            business logic (leads, content, notifications)
  models/              Mongoose schemas
  seed/                seed script + exported JSON
```

## Response shape

```json
{ "success": true, "message": "…", "data": {} }
{ "success": false, "message": "Please check the highlighted fields.", "errors": [{ "field": "email", "message": "…" }] }
```

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | uptime + DB state |
| POST | `/api/contact` | rate-limited, honeypot, validated |
| POST | `/api/consultation` | rate-limited, honeypot, validated |
| GET | `/api/services`, `/api/services/:slug` | published content |
| GET | `/api/projects`, `/api/projects/:slug` | published content |
| POST | `/api/health-checkup` | config-validated answers → score + recommendations |
| POST | `/api/lead-magnet` | returns the guide download URL |
| POST | `/api/applications` | multipart; resume PDF/DOC/DOCX ≤ 5 MB, magic-byte checked → GridFS |
| GET | `/api/posts`, `/api/posts/:slug`, `/api/jobs`, `/api/jobs/:slug` | published content (open jobs only) |
| POST | `/api/admin/login`, `/api/admin/logout` | httpOnly session cookie |
| GET | `/api/admin/me`, `/api/admin/stats` | 🔒 |
| GET | `/api/admin/:collection` | 🔒 enquiries · consultations · health-checkups · lead-magnet · applications (`?q=&status=&page=`) |
| PATCH | `/api/admin/:collection/:id/status` | 🔒 JSON only |
| GET | `/api/admin/applications/:id/resume` | 🔒 resume download |

## Admin credentials

```bash
npm run hash-password -- "a long unique password"   # → paste into ADMIN_PASSWORD_HASH
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # → JWT_SECRET
```

## Deployment notes

- `CORS_ORIGINS` must include the frontend domain (e.g. `https://riyadvi.vercel.app`): the Next.js
  rewrite forwards the browser's `Origin` header.
- Email is optional; leave `SMTP_HOST` empty to disable. Some free hosts restrict SMTP ports — an
  HTTP email API (Resend/Brevo) can replace the transport in `notification.service.js`.
