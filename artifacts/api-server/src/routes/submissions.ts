import { Router, type IRouter } from "express";
import { and, eq, ne } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  db,
  students,
  bankInformation,
  tuitionPaymentRequests,
  semesterReports,
  universitySemesters,
} from "@workspace/db";

const router: IRouter = Router();

router.post("/submissions", async (req, res) => {
  try {
    const {
      studentId,
      semesterLabel: rawSemesterLabel,
      universitySemesterId,
      amountDue,
      dueDate,
      invoiceFileUrl,
      message,
      bankAccountName,
      bankAccountNumber,
      bankName,
      promptpayNumber,
      qrPaymentImageUrl,
      gpa,
      creditsCompleted,
      passedAllCourses,
      transcriptFileUrl,
      wellbeingPhysical,
      wellbeingMental,
      wellbeingFinancial,
      wellbeingStress,
      wellbeingConfidence,
      challenges,
      activities,
      reflectionAchievement,
      reflectionChallenge,
      reflectionAdditional,
    } = req.body ?? {};

    if (!studentId) {
      res.status(400).json({ error: "Student ID is required." });
      return;
    }

    if (!amountDue || Number(amountDue) <= 0) {
      res.status(400).json({ error: "Tuition amount is required." });
      return;
    }

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    // Resolve semester label from universitySemesterId if needed
    let semesterLabel = rawSemesterLabel as string | null;
    if (universitySemesterId) {
      const whereClause = student.universityId
        ? and(
            eq(universitySemesters.id, universitySemesterId),
            eq(universitySemesters.isActive, true),
            eq(universitySemesters.universityId, student.universityId),
          )
        : and(
            eq(universitySemesters.id, universitySemesterId),
            eq(universitySemesters.isActive, true),
          );

      const [sem] = await db
        .select({ label: universitySemesters.label })
        .from(universitySemesters)
        .where(whereClause)
        .limit(1);

      if (!sem) {
        res.status(400).json({ error: "Please select a valid semester for your university." });
        return;
      }
      semesterLabel = sem.label;
    }

    if (!semesterLabel) {
      res.status(400).json({ error: "Semester is required." });
      return;
    }

    // Check for open request (blocking statuses)
    const [openRequest] = await db
      .select({ id: tuitionPaymentRequests.id, semesterLabel: tuitionPaymentRequests.semesterLabel })
      .from(tuitionPaymentRequests)
      .where(
        and(
          eq(tuitionPaymentRequests.studentId, studentId),
          ne(tuitionPaymentRequests.status, "REJECTED"),
          ne(tuitionPaymentRequests.status, "PAID"),
        ),
      )
      .limit(1);

    if (openRequest) {
      res.status(409).json({
        error: `You already have an open request for ${openRequest.semesterLabel}. Please wait for it to be processed.`,
      });
      return;
    }

    // Check for duplicate semester submission
    const dupWhere = universitySemesterId
      ? and(
          eq(tuitionPaymentRequests.studentId, studentId),
          eq(tuitionPaymentRequests.universitySemesterId, universitySemesterId),
          ne(tuitionPaymentRequests.status, "REJECTED"),
        )
      : and(
          eq(tuitionPaymentRequests.studentId, studentId),
          eq(tuitionPaymentRequests.semesterLabel, semesterLabel),
          ne(tuitionPaymentRequests.status, "REJECTED"),
        );

    const [duplicate] = await db
      .select({ semesterLabel: tuitionPaymentRequests.semesterLabel })
      .from(tuitionPaymentRequests)
      .where(dupWhere)
      .limit(1);

    if (duplicate) {
      res.status(409).json({
        error: `You have already submitted a request for ${duplicate.semesterLabel}.`,
      });
      return;
    }

    const now = new Date();
    const requestId = randomUUID();
    const reportId = randomUUID();

    const dueDateParsed = dueDate ? new Date(dueDate) : null;

    await db.insert(tuitionPaymentRequests).values({
      id: requestId,
      studentId,
      semesterLabel,
      amountDue: String(amountDue),
      dueDate: dueDateParsed && !Number.isNaN(dueDateParsed.getTime()) ? dueDateParsed : null,
      invoiceFileUrl: (invoiceFileUrl as string) || null,
      message: (message as string)?.trim() || null,
      status: "SUBMITTED",
      bankAccountName: (bankAccountName as string)?.trim() || null,
      bankAccountNumber: (bankAccountNumber as string)?.trim() || null,
      bankName: (bankName as string)?.trim() || null,
      promptpayNumber: (promptpayNumber as string)?.trim() || null,
      qrPaymentImageUrl: (qrPaymentImageUrl as string) || null,
      universitySemesterId: (universitySemesterId as string) || null,
      submittedAt: now,
      updatedAt: now,
    });

    await db.insert(semesterReports).values({
      id: reportId,
      studentId,
      tuitionPaymentRequestId: requestId,
      semesterLabel,
      gpa: gpa != null ? String(gpa) : null,
      creditsCompleted: creditsCompleted != null ? Number(creditsCompleted) : null,
      passedAllCourses: passedAllCourses != null ? Boolean(passedAllCourses) : null,
      transcriptFileUrl: (transcriptFileUrl as string) || null,
      wellbeingPhysical: wellbeingPhysical != null ? Number(wellbeingPhysical) : null,
      wellbeingMental: wellbeingMental != null ? Number(wellbeingMental) : null,
      wellbeingFinancial: wellbeingFinancial != null ? Number(wellbeingFinancial) : null,
      wellbeingStress: wellbeingStress != null ? Number(wellbeingStress) : null,
      wellbeingConfidence: wellbeingConfidence != null ? Number(wellbeingConfidence) : null,
      challenges: Array.isArray(challenges) ? challenges : [],
      activities: Array.isArray(activities) ? activities : [],
      reflectionAchievement: (reflectionAchievement as string) || null,
      reflectionChallenge: (reflectionChallenge as string) || null,
      reflectionAdditional: (reflectionAdditional as string) || null,
      universitySemesterId: (universitySemesterId as string) || null,
      submittedAt: now,
      updatedAt: now,
    });

    // Update bank information snapshot
    const bankPatch = {
      bankAccountName: (bankAccountName as string)?.trim() || null,
      bankAccountNumber: (bankAccountNumber as string)?.trim() || null,
      bankName: (bankName as string)?.trim() || null,
      promptpayNumber: (promptpayNumber as string)?.trim() || null,
      ...(qrPaymentImageUrl ? { qrPaymentImageUrl: qrPaymentImageUrl as string } : {}),
      lastUpdatedAt: now,
    };

    const [existingBank] = await db
      .select({ id: bankInformation.id })
      .from(bankInformation)
      .where(eq(bankInformation.studentId, studentId))
      .limit(1);

    if (existingBank) {
      await db
        .update(bankInformation)
        .set(bankPatch)
        .where(eq(bankInformation.studentId, studentId));
    } else {
      await db.insert(bankInformation).values({
        id: randomUUID(),
        studentId,
        ...bankPatch,
      });
    }

    // Set currentSemesterLabel if not already set
    if (!student.currentSemesterLabel) {
      await db
        .update(students)
        .set({ currentSemesterLabel: semesterLabel, updatedAt: now } as any)
        .where(eq(students.id, studentId));
    }

    res.status(201).json({ requestId, ok: true });
  } catch (err) {
    console.error("POST /submissions error", err);
    res.status(500).json({ error: "Could not save your submission. Please try again." });
  }
});

export default router;
