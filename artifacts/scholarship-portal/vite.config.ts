import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      // --- Next.js / backend shims (this app was ported from Next.js) ---
      "next/link": path.resolve(import.meta.dirname, "src/shims/next-link.tsx"),
      "next/image": path.resolve(import.meta.dirname, "src/shims/next-image.tsx"),
      "next/navigation": path.resolve(import.meta.dirname, "src/shims/next-navigation.ts"),
      "next/font/google": path.resolve(import.meta.dirname, "src/shims/next-font.ts"),
      "next/font/local": path.resolve(import.meta.dirname, "src/shims/next-font.ts"),
      "next/cache": path.resolve(import.meta.dirname, "src/shims/next-cache.ts"),
      "next/headers": path.resolve(import.meta.dirname, "src/shims/next-headers.ts"),
      "next-auth/providers/credentials": path.resolve(import.meta.dirname, "src/shims/next-auth-credentials.ts"),
      "next-auth/react": path.resolve(import.meta.dirname, "src/shims/next-auth-react.ts"),
      "next-auth/jwt": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "next-auth": path.resolve(import.meta.dirname, "src/shims/next-auth.ts"),
      "@prisma/client": path.resolve(import.meta.dirname, "src/shims/prisma-client.ts"),
      bcryptjs: path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      xlsx: path.resolve(import.meta.dirname, "src/shims/xlsx.ts"),
      jszip: path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "@netlify/blobs": path.resolve(import.meta.dirname, "src/shims/netlify-blobs.ts"),
      "node:fs/promises": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "node:fs": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "node:path": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "node:stream": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "node:crypto": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "node:buffer": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "node:util": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "node:os": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      "fs/promises": path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      fs: path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      os: path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      stream: path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      crypto: path.resolve(import.meta.dirname, "src/shims/empty.ts"),
      child_process: path.resolve(import.meta.dirname, "src/shims/empty.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
