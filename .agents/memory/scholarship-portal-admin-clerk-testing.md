---
name: Admin login blocks e2e testing
description: Why runTest() cannot reach admin-only pages in the scholarship portal
---

Admin login (`src/app/login/admin-clerk-login.tsx`) renders Clerk's real sign-in widget (Google OAuth), unlike student login which is a plain email/password form. `testClerkAuth: true` with `[Clerk Auth]` programmatic sign-in does not bypass this — the test browser still lands on the Clerk UI or redirects back to `/login`.

**Why:** the admin Clerk instance apparently isn't wired for the testing subagent's programmatic sign-in path the way a standard Clerk `<SignIn>` embed would be, or the seeded `admin@example.com` user isn't a real Clerk user (it's a Drizzle `users` table row from the DB seed, used for a legacy non-Clerk flow).

**How to apply:** when asked to e2e-test admin-only features, expect this to fail at the login step. Verify via typecheck + manual code/diff review instead, and note the limitation rather than retrying many times.
