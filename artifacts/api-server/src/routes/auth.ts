import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
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
      const sRows = await db.select().from(students).where(eq(students.userId, user.id)).limit(1);
      const student = sRows[0];
      if (student) {
        response.studentProfileId = student.id;
        response.firstName = student.firstName;
        response.lastName = student.lastName;
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

export default router;
