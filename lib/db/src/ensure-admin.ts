import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

const DEFAULT_ADMIN_EMAIL = "bill.ahognonvi+admin@techma.ca";
const DEFAULT_ADMIN_PASSWORD = "q9o&eEH*3^S*a!Ip";

/**
 * Guarantees at least one ADMIN account exists so a freshly provisioned
 * (empty) database is always usable. Safe to run on every server boot:
 * - If the admin email already exists, nothing changes (password is not reset).
 * - If no user with that email exists yet, it is created as ADMIN.
 */
export async function ensureDefaultAdmin() {
  const email = (process.env.DEFAULT_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

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
  console.log(`[ensure-admin] Created default admin account: ${email}`);
}
