import { Router, type IRouter, type Request } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, users, students } from "@workspace/db";

const router: IRouter = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    const rows = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    const user = rows[0];

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const response: Record<string, unknown> = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    if (user.role === "STUDENT") {
      const studentRows = await db
        .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
        .from(students)
        .where(eq(students.userId, user.id))
        .limit(1);
      const profile = studentRows[0];
      if (profile) {
        response.studentProfileId = profile.id;
        response.firstName = profile.firstName;
        response.lastName = profile.lastName;
      }
    }

    res.json(response);
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Sign-in is temporarily unavailable." });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ ok: true });
});

/**
 * Exchange a Clerk session for an admin portal session.
 * Called by the frontend after the admin signs into Clerk on the login page.
 * Uses the Clerk session cookie (set by clerkMiddleware) to identify the user,
 * then verifies they are an ADMIN in the DB and returns the session payload.
 */
router.post("/auth/clerk-admin-session", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      res.status(401).json({ error: "Not authenticated with Clerk." });
      return;
    }

    // Fetch the Clerk user's primary email via the backend API
    const clerkResp = await fetch(`https://api.clerk.com/v1/users/${auth.userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    if (!clerkResp.ok) {
      res.status(500).json({ error: "Could not verify Clerk identity." });
      return;
    }
    const clerkUser = (await clerkResp.json()) as {
      email_addresses: Array<{ email_address: string; id: string }>;
      primary_email_address_id: string;
    };

    const primary = clerkUser.email_addresses.find(
      (e) => e.id === clerkUser.primary_email_address_id,
    );
    const email = primary?.email_address?.toLowerCase().trim();
    if (!email) {
      res.status(500).json({ error: "Could not read email from Clerk." });
      return;
    }

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];

    if (!user || !user.isActive) {
      res.status(403).json({ error: "No active account found for this email." });
      return;
    }
    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "This account does not have admin access." });
      return;
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error("Clerk admin session error", err);
    res.status(500).json({ error: "Sign-in is temporarily unavailable." });
  }
});

async function getAdminEmailFromClerk(req: Request): Promise<string | null> {
  const auth = getAuth(req);
  if (!auth.userId) return null;

  const clerkResp = await fetch(`https://api.clerk.com/v1/users/${auth.userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  if (!clerkResp.ok) return null;

  const clerkUser = (await clerkResp.json()) as {
    email_addresses: Array<{ email_address: string; id: string }>;
    primary_email_address_id: string;
  };
  const primary = clerkUser.email_addresses.find(
    (e) => e.id === clerkUser.primary_email_address_id,
  );
  return primary?.email_address?.toLowerCase().trim() ?? null;
}

/**
 * Admin-only endpoint to list all admin accounts, enriched with their Clerk
 * profile picture. Requires the caller to be an authenticated ADMIN.
 */
router.get("/auth/admins", async (req, res) => {
  try {
    const callerEmail = await getAdminEmailFromClerk(req);
    if (!callerEmail) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const callerRows = await db.select().from(users).where(eq(users.email, callerEmail)).limit(1);
    const caller = callerRows[0];
    if (!caller || !caller.isActive || caller.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required." });
      return;
    }

    const dbAdmins = await db.select().from(users).where(eq(users.role, "ADMIN"));
    const dbAdminByEmail = new Map(dbAdmins.map((a) => [a.email.toLowerCase().trim(), a]));

    // Source of truth for "does this admin still exist" is Clerk itself — a
    // user deleted in Clerk must disappear here even if a stale row remains
    // in our local DB. Page through every Clerk user and keep only the ones
    // whose email matches a local ADMIN record.
    const clerkUsers: Array<{
      id: string;
      image_url?: string;
      email_addresses: Array<{ email_address: string }>;
    }> = [];
    const pageSize = 100;
    for (let offset = 0; offset < 2000; offset += pageSize) {
      const clerkResp = await fetch(
        `https://api.clerk.com/v1/users?limit=${pageSize}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
        },
      );
      if (!clerkResp.ok) break;
      const page = (await clerkResp.json()) as typeof clerkUsers;
      clerkUsers.push(...page);
      if (page.length < pageSize) break;
    }

    const result = clerkUsers
      .map((cu) => {
        const email = cu.email_addresses[0]?.email_address?.toLowerCase().trim() ?? "";
        const dbAdmin = dbAdminByEmail.get(email);
        if (!dbAdmin || !dbAdmin.isActive) return null;
        return {
          id: cu.id,
          email,
          imageUrl: cu.image_url ?? null,
          lastLoginAt: dbAdmin.lastLoginAt ? dbAdmin.lastLoginAt.toISOString() : null,
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .sort((a, b) => a.email.localeCompare(b.email));

    res.json({ admins: result });
  } catch (err) {
    console.error("List admins error", err);
    res.status(500).json({ error: "Could not load admin accounts." });
  }
});

/**
 * Admin-only endpoint to create a new admin account.
 * Caller must be authenticated with Clerk and have the ADMIN role in the DB.
 * Creates a Clerk user + local DB row with a generated password.
 */
router.post("/auth/create-admin", async (req, res) => {
  try {
    const callerEmail = await getAdminEmailFromClerk(req);
    if (!callerEmail) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const callerRows = await db.select().from(users).where(eq(users.email, callerEmail)).limit(1);
    const caller = callerRows[0];
    if (!caller || !caller.isActive || caller.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required." });
      return;
    }

    const { email } = req.body ?? {};
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required." });
      return;
    }
    const emailLower = email.toLowerCase().trim();

    // Validate email format loosely
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      res.status(400).json({ error: "Invalid email address." });
      return;
    }

    // Prevent duplicate
    const existing = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    // Generate a secure temporary password
    const { randomBytes } = await import("node:crypto");
    const tempPassword = randomBytes(9).toString("base64").replace(/[+/=]/g, "x") + "!A1";

    // Create Clerk user
    const clerkResp = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [emailLower],
        password: tempPassword,
        skip_password_checks: true,
      }),
    });
    const clerkData = await clerkResp.json();
    if (!clerkResp.ok) {
      res.status(500).json({ error: "Clerk user creation failed.", detail: clerkData });
      return;
    }

    // Create local DB row
    const { randomUUID } = await import("node:crypto");
    const hash = await bcrypt.hash(tempPassword, 10);
    await db.insert(users).values({
      id: randomUUID(),
      email: emailLower,
      passwordHash: hash,
      role: "ADMIN",
      isActive: true,
    });

    res.json({ ok: true, email: emailLower, generatedPassword: tempPassword });
  } catch (err) {
    console.error("Create admin error", err);
    res.status(500).json({ error: "Could not create admin account." });
  }
});

export default router;
