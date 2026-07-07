import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { and, desc, eq, ilike, ne } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  db,
  students,
  users,
  bankInformation,
  universities,
  tuitionPaymentRequests,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/students", async (_req, res) => {
  try {
    const rows = await db
      .select({
        student: students,
        university: universities,
        userEmail: users.email,
        userRole: users.role,
        bank: bankInformation,
      })
      .from(students)
      .leftJoin(universities, eq(students.universityId, universities.id))
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(bankInformation, eq(bankInformation.studentId, students.id))
      .orderBy(desc(students.createdAt));

    const result = rows.map((r) => ({
      ...r.student,
      university: r.university ?? null,
      user: { email: r.userEmail, role: r.userRole },
      bankInformation: r.bank ?? null,
    }));

    res.json(result);
  } catch (err) {
    console.error("GET /students error", err);
    res.status(500).json({ error: "Failed to fetch students." });
  }
});

router.get("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [row] = await db
      .select({
        student: students,
        university: universities,
        userEmail: users.email,
        userRole: users.role,
        bank: bankInformation,
      })
      .from(students)
      .leftJoin(universities, eq(students.universityId, universities.id))
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(bankInformation, eq(bankInformation.studentId, students.id))
      .where(eq(students.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    const requests = await db
      .select()
      .from(tuitionPaymentRequests)
      .where(eq(tuitionPaymentRequests.studentId, id))
      .orderBy(desc(tuitionPaymentRequests.submittedAt));

    res.json({
      ...row.student,
      university: row.university ?? null,
      user: { email: row.userEmail, role: row.userRole },
      bankInformation: row.bank ?? null,
      tuitionPaymentRequests: requests,
    });
  } catch (err) {
    console.error("GET /students/:id error", err);
    res.status(500).json({ error: "Failed to fetch student." });
  }
});

router.post("/students", async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      studentId,
      phone,
      universityId,
      degreeProgram,
      yearOfStudy,
      currentSemesterLabel,
      gpa,
      status,
    } = req.body ?? {};

    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required." });
      return;
    }
    if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
      res.status(400).json({ error: "First name is required." });
      return;
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters." });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    if (studentId) {
      const [dupStudentId] = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.studentId, studentId))
        .limit(1);
      if (dupStudentId) {
        res.status(409).json({ error: "This Student ID is already in use." });
        return;
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = randomUUID();
    const studentDbId = randomUUID();
    const bankId = randomUUID();
    const studentStatus = (["ACTIVE", "GRADUATED", "INACTIVE"].includes(status) ? status : "ACTIVE") as "ACTIVE" | "GRADUATED" | "INACTIVE";

    await db.insert(users).values({
      id: userId,
      email: emailLower,
      passwordHash,
      role: "STUDENT",
      isActive: studentStatus === "ACTIVE",
    });

    await db.insert(students).values({
      id: studentDbId,
      userId,
      firstName: firstName.trim(),
      lastName: (lastName as string)?.trim() || "",
      studentId: (studentId as string)?.trim() || null,
      phone: (phone as string)?.trim() || null,
      universityId: (universityId as string) || null,
      degreeProgram: (degreeProgram as string)?.trim() || null,
      yearOfStudy: (yearOfStudy as string)?.trim() || null,
      currentSemesterLabel: (currentSemesterLabel as string)?.trim() || null,
      gpa: (gpa as string)?.trim() || null,
      status: studentStatus,
    });

    await db.insert(bankInformation).values({
      id: bankId,
      studentId: studentDbId,
    });

    res.status(201).json({ id: studentDbId, userId });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    console.error("POST /students error", err);
    res.status(500).json({ error: "Failed to create student." });
  }
});

router.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};

    const [existing] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    const studentPatch: Record<string, unknown> = { updatedAt: new Date() };

    if ("firstName" in body) {
      const firstName = (body.firstName as string)?.trim();
      if (!firstName) {
        res.status(400).json({ error: "First name is required." });
        return;
      }
      studentPatch.firstName = firstName;
    }
    if ("lastName" in body) studentPatch.lastName = (body.lastName as string)?.trim() ?? "";
    if ("studentId" in body) {
      const newStudentId = (body.studentId as string)?.trim() || null;
      if (newStudentId) {
        const [dup] = await db
          .select({ id: students.id })
          .from(students)
          .where(and(eq(students.studentId, newStudentId), ne(students.id, id)))
          .limit(1);
        if (dup) {
          res.status(409).json({ error: "This Student ID is already in use." });
          return;
        }
      }
      studentPatch.studentId = newStudentId;
    }
    if ("phone" in body) studentPatch.phone = (body.phone as string)?.trim() || null;
    if ("universityId" in body) studentPatch.universityId = (body.universityId as string) || null;
    if ("degreeProgram" in body) studentPatch.degreeProgram = (body.degreeProgram as string)?.trim() || null;
    if ("yearOfStudy" in body) studentPatch.yearOfStudy = (body.yearOfStudy as string)?.trim() || null;
    if ("currentSemesterLabel" in body) studentPatch.currentSemesterLabel = (body.currentSemesterLabel as string)?.trim() || null;
    if ("gpa" in body) studentPatch.gpa = body.gpa != null ? String(body.gpa).trim() || null : null;
    if ("status" in body) {
      const validStatuses = ["ACTIVE", "GRADUATED", "INACTIVE"];
      if (!validStatuses.includes(body.status)) {
        res.status(400).json({ error: "Invalid status." });
        return;
      }
      studentPatch.status = body.status as "ACTIVE" | "GRADUATED" | "INACTIVE";
    }
    if ("photoUrl" in body) studentPatch.photoUrl = (body.photoUrl as string) || null;

    if (Object.keys(studentPatch).length > 1) {
      await db
        .update(students)
        .set(studentPatch as any)
        .where(eq(students.id, id));
    }

    const bankFields = ["bankAccountName", "bankAccountNumber", "bankName", "promptpayNumber"];
    const hasBankFields = bankFields.some((f) => f in body);
    if (hasBankFields) {
      const bankPatch = {
        bankAccountName: (body.bankAccountName as string)?.trim() || null,
        bankAccountNumber: (body.bankAccountNumber as string)?.trim() || null,
        bankName: (body.bankName as string)?.trim() || null,
        promptpayNumber: (body.promptpayNumber as string)?.trim() || null,
        lastUpdatedAt: new Date(),
      };

      const [existingBank] = await db
        .select({ id: bankInformation.id })
        .from(bankInformation)
        .where(eq(bankInformation.studentId, id))
        .limit(1);

      if (existingBank) {
        await db
          .update(bankInformation)
          .set(bankPatch)
          .where(eq(bankInformation.studentId, id));
      } else {
        await db.insert(bankInformation).values({
          id: randomUUID(),
          studentId: id,
          ...bankPatch,
        });
      }
    }

    const userPatch: Record<string, unknown> = { updatedAt: new Date() };
    let hasUserPatch = false;

    if ("status" in body) {
      userPatch.isActive = body.status === "ACTIVE";
      hasUserPatch = true;
    }
    if ("email" in body && typeof body.email === "string" && body.email.trim()) {
      const newEmail = body.email.toLowerCase().trim();
      const [dupEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, newEmail), ne(users.id, existing.userId)))
        .limit(1);
      if (dupEmail) {
        res.status(409).json({ error: "An account with this email already exists." });
        return;
      }
      userPatch.email = newEmail;
      hasUserPatch = true;
    }
    if ("password" in body && typeof body.password === "string" && body.password.length >= 8) {
      userPatch.passwordHash = await bcrypt.hash(body.password, 12);
      hasUserPatch = true;
    }

    if (hasUserPatch) {
      await db
        .update(users)
        .set(userPatch as any)
        .where(eq(users.id, existing.userId));
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /students/:id error", err);
    res.status(500).json({ error: "Failed to update student." });
  }
});

router.put("/students/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (!["INACTIVE", "GRADUATED"].includes(status)) {
      res.status(400).json({ error: "Invalid archive status." });
      return;
    }

    const [existing] = await db
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    await db
      .update(students)
      .set({ status: status as "INACTIVE" | "GRADUATED", updatedAt: new Date() } as any)
      .where(eq(students.id, id));

    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() } as any)
      .where(eq(users.id, existing.userId));

    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /students/:id/archive error", err);
    res.status(500).json({ error: "Failed to archive student." });
  }
});

router.patch("/students/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    await db
      .update(students)
      .set({ status: "ACTIVE", updatedAt: new Date() } as any)
      .where(eq(students.id, id));

    await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() } as any)
      .where(eq(users.id, existing.userId));

    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /students/:id/activate error", err);
    res.status(500).json({ error: "Failed to activate student." });
  }
});

export default router;
