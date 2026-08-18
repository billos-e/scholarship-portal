import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, users, type User } from "@workspace/db";

export type AdminRequest = Request & { admin: User };

async function clerkPrimaryEmail(req: Request): Promise<string | null> {
  const auth = getAuth(req);
  if (!auth.userId || !process.env.CLERK_SECRET_KEY) return null;

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
 * Resolves the current admin from `X-Admin-Id` (portal session) or Clerk.
 * Sends 401/403 and returns null when the caller is not an active ADMIN.
 */
export async function resolveAdmin(
  req: Request,
  res: Response,
): Promise<User | null> {
  const adminId = req.header("x-admin-id")?.trim();
  if (adminId) {
    const [user] = await db.select().from(users).where(eq(users.id, adminId)).limit(1);
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Authentication required." });
      return null;
    }
    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required." });
      return null;
    }
    return user;
  }

  const email = await clerkPrimaryEmail(req);
  if (!email) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.isActive) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }
  if (user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required." });
    return null;
  }
  return user;
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await resolveAdmin(req, res);
    if (!user) return;
    (req as AdminRequest).admin = user;
    next();
  } catch (err) {
    console.error("requireAdmin error", err);
    res.status(500).json({ error: "Authentication required." });
  }
}
