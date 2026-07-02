#!/usr/bin/env bash
set -euo pipefail

# Prisma expects DATABASE_URL / DIRECT_URL. The Netlify Supabase extension
# injects API keys (NEXT_PUBLIC_SUPABASE_*, SUPABASE_ANON_KEY, etc.) but not
# Postgres URIs — set DATABASE_URL and DIRECT_URL in Site configuration.

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "In Supabase → Project Settings → Database, copy:"
  echo "  - Transaction pooler URI → DATABASE_URL (port 6543, ?pgbouncer=true)"
  echo "  - Direct connection URI → DIRECT_URL (port 5432)"
  exit 1
fi

if [[ -z "${DIRECT_URL:-}" ]]; then
  echo "ERROR: DIRECT_URL is not set (required for prisma migrate deploy with Supabase)."
  exit 1
fi

if [[ -z "${AUTH_SECRET:-}" ]]; then
  echo "ERROR: AUTH_SECRET is not set. Generate one with: openssl rand -base64 32"
  exit 1
fi

npm run db:deploy || {
  echo "Migration failed — baselining existing Supabase schema (first deploy)..."
  npx prisma migrate resolve --applied 20260625190228_init
  npm run db:deploy
}
npm run build
