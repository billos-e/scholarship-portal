---
name: Scholarship portal read layer
description: How the Vite SPA reads data and how to build it locally
---

# Scholarship portal: reads go through the API server

The Vite SPA (`artifacts/scholarship-portal`) reads all data from the Express
API server (`artifacts/api-server`) via a typed client layer in
`src/lib/api/*` (shared, academic, students, requests, universities). There is
no in-memory sample data anymore — `src/lib/stub/sample-data.ts` was deleted.

**Page pattern:** pages are client components (`"use client"`) using
`useState`/`useEffect`. Tri-state: `undefined` = loading (render `Skeleton`),
`null` = not found (render `import NotFound from "@/pages/not-found"`), value =
data. Route params via `useParams` from `next/navigation` (shimmed).

**API date handling:** JSON responses carry ISO strings; the client revives
`Date` fields via `reviveDates` in `src/lib/api/shared.ts`. Decimals stay as
strings (call `.toString()` at render / format time).

**Build gate:** `vite build` (esbuild strips types, so type mismatches do NOT
fail the build — match runtime shapes to component props). The build/dev config
**requires `PORT` and `BASE_PATH` env vars** or it throws before bundling, e.g.
`PORT=8080 BASE_PATH=/scholarship-portal pnpm exec vite build`.

**Express route ordering:** static routes (e.g. `/requests/semester-labels`)
must be registered BEFORE parametric `/:id` routes, or the literal path is
swallowed by the param.

**Why:** the portal was ported from Next.js server components to a Vite SPA;
reads had to move from Prisma/sample-data to HTTP fetches against the API.
