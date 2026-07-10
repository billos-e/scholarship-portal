import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

const DEFAULT_ADMIN_EMAIL = "bill.ahognonvi+admin@techma.ca";
const DEFAULT_ADMIN_PASSWORD = "q9o&eEH*3^S*a!Ip";

async function findClerkUserByEmail(email: string): Promise<{ id: string } | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  const resp = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  if (!resp.ok) return null;
  const rows = (await resp.json()) as Array<{ id: string }>;
  return rows[0] ?? null;
}

async function createClerkUser(email: string, password: string): Promise<{ id: string } | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  const resp = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [email],
      password,
      skip_password_checks: true,
      skip_password_requirement: true,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.error("[ensure-admin] Clerk user creation failed:", data);
    return null;
  }
  return data as { id: string };
}

/**
 * Guarantees at least one ADMIN account exists — both as a Clerk user (used
 * for the real admin login flow) and as a local `users` row (role=ADMIN) —
 * so a freshly provisioned (empty) database/deployment is always usable.
 *
 * Safe to run on every server boot, in every environment (dev + production):
 * - If the local DB row already exists, its password is left untouched.
 * - If a Clerk account with this email already exists, it is reused as-is.
 * - Otherwise both are created so the account works end-to-end.
 */
export async function ensureDefaultAdmin() {
  const email = (process.env.DEFAULT_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  let clerkUser = await findClerkUserByEmail(email);
  if (!clerkUser) {
    clerkUser = await createClerkUser(email, password);
    if (clerkUser) {
      // eslint-disable-next-line no-console
      console.log(`[ensure-admin] Created Clerk account: ${email}`);
    }
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    id: randomUUID(),
    email,
    passwordHash,
    role: "ADMIN",
    isActive: true,
  });

  // eslint-disable-next-line no-console
  console.log(`[ensure-admin] Created default admin DB record: ${email}`);
}
