# Student Scholarship Portal

Centralized web platform that replaces the manual spreadsheet + email process
for managing scholarship students: tuition payment requests, semester reports,
document uploads, and payment tracking.

> Functional specification and roadmap live in [`docs/`](./docs).
> Start with [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md).

## Tech stack

| Layer    | Choice                                  |
| -------- | --------------------------------------- |
| Framework| Next.js 16 (App Router) + TypeScript    |
| ORM      | Prisma 6 (versioned migrations)         |
| Database | PostgreSQL via **Supabase** (local dev + production on Netlify) |
| Auth     | Auth.js v5 (Credentials) — `STUDENT` / `ADMIN` |
| UI       | Tailwind CSS v4 + shadcn/ui (Base UI)   |
| Forms    | React Hook Form + Zod                   |

**Guiding principle:** one codebase. Only `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
and `UPLOAD_DIR` change between environments. Local dev and Netlify production both
use the same Supabase Postgres project; Docker Postgres remains an optional offline
fallback.

## Local setup

### 1. Prerequisites

- Node.js 20+ and npm
- Access to the **schoolarship app** Supabase project (org: *Techma hosted db*)

### 2. Database (Supabase — local dev)

1. In [Supabase Dashboard](https://supabase.com/dashboard) → **schoolarship app**
   → **Project Settings** → **Database**, copy:
   - **Transaction pooler** → `DATABASE_URL` (port `6543`, include `?pgbouncer=true`)
   - **Direct connection** → `DIRECT_URL` (port `5432`)
2. Replace `[YOUR-PASSWORD]` in the connection strings with the database password.

The initial Prisma schema is already applied on this Supabase project. After
cloning, if `npm run db:migrate` reports the migration as pending while tables
already exist, run once:

```bash
npx prisma migrate resolve --applied 20260625190228_init
```

**Optional fallback — Docker Postgres** (offline / no network):

```bash
docker compose up -d
docker compose ps   # wait for "healthy"
```

Use `postgresql://scholarship:scholarship_dev@localhost:5432/scholarship` for
both `DATABASE_URL` and `DIRECT_URL`, then `npm run db:migrate`.

### 3. Environment variables

```bash
cp .env.example .env
# Generate an AUTH_SECRET: openssl rand -base64 32
```

`.env` is read by both the Prisma CLI and Next.js. Never commit it.

### 4. Install, migrate, seed

```bash
npm install
npm run db:seed           # load test data (schema already on Supabase)
npm run dev               # http://localhost:3000
```

For new migrations during development: `npm run db:migrate`.

### Test accounts (from seed)

| Role    | Email                          | Password      |
| ------- | ------------------------------ | ------------- |
| Admin   | `admin@example.com`            | `password123` |
| Student | `anong.saetang@example.com`    | `password123` |

A disabled (graduated) account `graduated@example.com` exists to verify that
login is refused while historical data is preserved.

## npm scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the dev server                         |
| `npm run build`    | `prisma generate` + production build         |
| `npm run start`    | Start the production server                  |
| `npm run lint`     | ESLint                                       |
| `npm run db:migrate` | Create/apply a dev migration               |
| `npm run db:deploy`  | Apply migrations in production (Netlify build) |
| `npm run db:seed`    | Seed test data                             |
| `npm run db:studio`  | Open Prisma Studio                         |
| `npm run db:reset`   | Reset the database (drops data)            |

## Project structure

```
prisma/
  schema.prisma        # all data models (see plan §4)
  seed.ts              # test data
  migrations/          # versioned SQL migrations (committed)
src/
  app/
    login/             # login page + form
    student/           # student portal (dashboard, profile, submit, history)
    admin/             # admin dashboard (requests, students, universities)
    api/
      auth/[...nextauth]/route.ts
      uploads/[...path]/route.ts   # authorized file download
  auth.ts              # Auth.js full config (Node runtime, Credentials)
  auth.config.ts       # edge-safe config (callbacks, route authorization)
  proxy.ts             # route protection middleware (Next 16 "proxy")
  components/
    ui/                # shadcn/ui components
    layout/            # app shell, nav, sign-out
  lib/
    prisma.ts          # Prisma client singleton
    auth/              # password hashing + session helpers
    actions/           # server actions (students, submissions, requests, …)
    uploads.ts         # file validation + storage helpers
    format.ts          # currency/date formatting
```

## Implementation status

- [x] **Phase 0 — Foundations:** Docker Postgres, Prisma schema + migration,
      seed, Auth.js (login, roles, route protection), student/admin shells,
      dashboards, login page.
- [x] **Phase 1 — Profiles & reference data:** admin CRUD for universities and
      students (with account provisioning, status/access management, password
      reset) and student-side profile editing (phone + bank info).
- [x] **Phase 2 — Semester submission:** grouped payment + report form, invoice /
      transcript / QR uploads, bank snapshot, student history (list + read-only
      detail).
- [x] **Phase 3 — Admin workflow:** filtered request list, detail page with
      documents, status transitions (`Submitted` → `Under Review` → `Approved` →
      `Paid`), internal notes, dashboard KPIs.
- [ ] Phase 4 — Export, import, polish, durable file storage (Netlify Blobs)

## Deploying to Netlify (production)

Production is deployed from `main` on Netlify (`scholarship-portal-app.netlify.app`).

1. Connect the GitHub repo in Netlify (branch: `main`, framework: Next.js).
2. In **Build settings**, leave **Publish directory** empty (or `.next`) — `netlify.toml`
   sets `publish = ".next"`. Do **not** set it to `/` or the repo root.
3. Install the **Supabase** extension and link the *schoolarship app* project.
4. In **Site configuration → Environment variables**, set (from Supabase → Database):
   - `DATABASE_URL` — Transaction pooler URI (port `6543`, `?pgbouncer=true`, host `aws-1-us-west-2`)
   - `DIRECT_URL` — Direct connection URI (port `5432`, host `aws-1-us-west-2`)
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `UPLOAD_DIR` — `/tmp/uploads` (ephemeral on serverless; migrate to Blobs in phase 4)
   - `AUTH_URL` — `https://scholarship-portal-app.netlify.app` (optional; `trustHost` is enabled in code)
5. Build runs `scripts/netlify-build.sh` (`prisma migrate deploy` + `next build`).
6. After first deploy, seed if needed: run `npm run db:seed` locally against the Supabase DB, or via Netlify CLI.

Local dev with Netlify env injection: `netlify dev` (after `netlify link`).

## Deploying to Replit (legacy / alternate)

Replit was the original target; production currently runs on Netlify + Supabase.
These steps remain valid if you deploy elsewhere with a plain Postgres URL:

1. Push the repo to GitHub / import into Replit.
2. Set `DATABASE_URL`, `DIRECT_URL` (same value as `DATABASE_URL` on Replit),
   and `AUTH_SECRET` in Replit secrets.
3. Run `npm run db:deploy` (applies migrations — no code change needed).
4. Run `npm run db:seed` (or the client import script) if needed.
5. Test the critical flows in production.

No business-logic change should be required between environments — only
configuration and data.
