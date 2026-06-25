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
| Database | PostgreSQL 16 (Docker locally, Replit in prod) |
| Auth     | Auth.js v5 (Credentials) — `STUDENT` / `ADMIN` |
| UI       | Tailwind CSS v4 + shadcn/ui (Base UI)   |
| Forms    | React Hook Form + Zod                   |

**Guiding principle:** one codebase. The only thing that changes between local
and Replit is `DATABASE_URL`.

## Local setup

### 1. Prerequisites

- Node.js 20+ and npm
- Docker (daemon running) — `docker --version`, `docker compose version`

### 2. Database (Docker Postgres)

```bash
docker compose up -d      # start Postgres
docker compose ps         # wait for "healthy"
```

| Setting   | Value                                                          |
| --------- | -------------------------------------------------------------- |
| Container | `scholarship-postgres`                                         |
| URL       | `postgresql://scholarship:scholarship_dev@localhost:5432/scholarship` |

`docker compose down` keeps the data; `docker compose down -v` **deletes** it.

### 3. Environment variables

```bash
cp .env.example .env
# Generate an AUTH_SECRET: openssl rand -base64 32
```

`.env` is read by both the Prisma CLI and Next.js. Never commit it.

### 4. Install, migrate, seed

```bash
npm install
npm run db:migrate        # apply migrations to local Postgres
npm run db:seed           # load test data
npm run dev               # http://localhost:3000
```

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
| `npm run db:deploy`  | Apply migrations in production (Replit)    |
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
    api/auth/[...nextauth]/route.ts
  auth.ts              # Auth.js full config (Node runtime, Credentials)
  auth.config.ts       # edge-safe config (callbacks, route authorization)
  proxy.ts             # route protection middleware (Next 16 "proxy")
  components/
    ui/                # shadcn/ui components
    layout/            # app shell, nav, sign-out
  lib/
    prisma.ts          # Prisma client singleton
    auth/              # password hashing + session helpers
    actions/           # server actions
    format.ts          # currency/date formatting
```

## Implementation status

- [x] **Phase 0 — Foundations:** Docker Postgres, Prisma schema + migration,
      seed, Auth.js (login, roles, route protection), student/admin shells,
      dashboards, login page.
- [ ] Phase 1 — Profiles & reference data (CRUD students/universities, profile edit)
- [ ] Phase 2 — Semester submission (payment request + report + uploads)
- [ ] Phase 3 — Admin workflow (request list, filters, status transitions, notes)
- [ ] Phase 4 — Export, import, polish, Replit deployment

## Deploying to Replit (end of project)

1. Push the repo to GitHub / import into Replit.
2. Set `DATABASE_URL` and `AUTH_SECRET` in Replit secrets.
3. Run `npm run db:deploy` (applies migrations — no code change needed).
4. Run `npm run db:seed` (or the client import script) if needed.
5. Test the critical flows in production.

No business-logic change should be required between local and Replit — only
configuration and data.
