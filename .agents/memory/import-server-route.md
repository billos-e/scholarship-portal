---
name: Import validators need server-side execution
description: Why the Prisma shim breaks import preview/commit DB lookups and how it was fixed.
---

## The rule
Import preview and commit logic must execute on the Express API server, not in the browser. Use `POST /api/import/preview` and `POST /api/import/commit`.

**Why:** The Vite SPA build aliases `@prisma/client` to `src/shims/prisma-client.ts` — a deep proxy stub where every `findFirst`/`findUnique` returns `null` and every `findMany` returns `[]`. Any code that calls `prisma.*` in the browser gets stub results, not real DB data. This caused:
- Student import: university lookup always returned null → "not found — will be created" even when the university existed.
- Payment import: payment request lookup always returned null → hard "not found" error on every row.

**How to apply:** When adding new import entity types or new DB lookups inside existing entities, implement them in `artifacts/api-server/src/routes/import.ts` using Drizzle. The SPA's `lib/actions/import.ts` is only a thin wrapper that calls the API; all real logic lives server-side. `parseImportFile` is the only function that stays browser-side (pure file parsing, no DB).
