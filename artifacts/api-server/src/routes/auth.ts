import { Router, type IRouter } from "express";
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
    console.log("[clerk-admin-session] auth.userId:", auth.userId, "hasSessionClaims:", !!auth.sessionClaims);
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

    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error("Clerk admin session error", err);
    res.status(500).json({ error: "Sign-in is temporarily unavailable." });
  }
});

export default router;
