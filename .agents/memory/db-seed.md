---
name: DB seed command
description: How to re-run the database seed and where tsx lives in this pnpm workspace
---

The workspace does not have `tsx` in a standard location. It lives at:
`node_modules/.pnpm/tsx@4.22.4/node_modules/tsx/dist/cli.mjs`

To re-seed: `pnpm --filter @workspace/db run seed`
Or directly: `node node_modules/.pnpm/tsx@4.22.4/node_modules/tsx/dist/cli.mjs lib/db/seed.ts`

The seed file is at `lib/db/seed.ts`. It is upsert-safe (skips existing rows).
Test credentials: `admin@example.com / password123`, `somchai.jaidee@example.com / password123`

**Why:** tsx is a devDependency of the root workspace (pulled in by vite/esbuild tooling) but not exposed in `.bin/`. Must use the full pnpm store path.
