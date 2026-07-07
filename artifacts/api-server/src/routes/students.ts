import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, students, users, bankInformation } from "@workspace/db";

const router: IRouter = Router();

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
    if ("gpa" in body) studentPatch.gpa = (body.gpa as string)?.trim() || null;
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

export default router;
