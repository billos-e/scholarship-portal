// Minimal shim for the bare "next" package.
// Only type-level usages (e.g. `import type { Metadata } from "next"`) are
// expected — this app runs as a Vite SPA, not Next.js.
export type Metadata = Record<string, unknown>;
