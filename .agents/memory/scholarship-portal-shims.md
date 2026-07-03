---
name: Scholarship portal shim strategy
description: The scholarship portal was ported from Next.js to Vite+React using Vite alias shims. Key decisions and gotchas.
---

The app at `artifacts/scholarship-portal/` is a Vite+React port of a Next.js app. Rather than rewriting server-only code, Vite aliases redirect imports to stub shims in `src/shims/`.

**Shim files:**
- `next-link.tsx`, `next-image.tsx` — passthrough wrappers
- `next-navigation.ts` — backed by wouter (useParams, useRouter, etc.)
- `next-auth.ts`, `next-auth-react.ts`, `next-auth-credentials.ts` — stubs
- `prisma-client.ts` — deep-proxy PrismaClient + enums (Role/StudentStatus/RequestStatus/TermCode)
- `node-stub.ts` — named exports for node builtins (mkdir, stat, Readable, randomBytes, etc.)
- `xlsx.ts`, `netlify-blobs.ts` — named-export stubs (empty.ts only works for default imports)
- `empty.ts` — catch-all default-only proxy

**Why empty.ts alone isn't enough:** Rollup requires named exports to exist statically. Any `import { named } from shimmed-module` will fail at build time if the shim only has a default export. Server-only modules that use named node builtin imports need `node-stub.ts` or a dedicated shim.

**Pages:** All 18 page.tsx converted from async server components to sync, using getters from `src/lib/stub/sample-data.ts`. Session helpers in `src/lib/auth/session.ts` are sync stubs.

**Providers required in App.tsx:** `NavigationLoadingProvider` (from `components/layout/navigation-loading`) must wrap the router — admin components use `useNavigationLoading()`.

**How to apply:** When adding new pages, keep them sync and use sample-data getters. When adding new server-only dependencies, add a named-export shim and alias it in `vite.config.ts`.
