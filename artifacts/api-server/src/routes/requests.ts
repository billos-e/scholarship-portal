import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  db,
  tuitionPaymentRequests,
  paymentHistory,
  semesterReports,
  students,
  users,
  universities,
  universitySemesters,
} from "@workspace/db";

const router: IRouter = Router();

const requestStudentSelect = {
  request: tuitionPaymentRequests,
  studentId: students.id,
  studentFirstName: students.firstName,
  studentLastName: students.lastName,
  studentStudentId: students.studentId,
  studentUniversityId: students.universityId,
  universityName: universities.name,
  userEmail: users.email,
  semAcademicYear: universitySemesters.academicYear,
  semLabel: universitySemesters.label,
  semId: universitySemesters.id,
} as const;

type RequestStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "PAID" | "REJECTED";

router.get("/requests", async (_req, res) => {
  try {
    const rows = await db
      .select(requestStudentSelect)
      .from(tuitionPaymentRequests)
      .innerJoin(students, eq(tuitionPaymentRequests.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(universities, eq(students.universityId, universities.id))
      .leftJoin(
        universitySemesters,
        eq(tuitionPaymentRequests.universitySemesterId, universitySemesters.id),
      )
      .orderBy(desc(tuitionPaymentRequests.submittedAt));

    const result = await Promise.all(
      rows.map(async (r) => {
        const [pay] = await db
          .select()
          .from(paymentHistory)
          .where(eq(paymentHistory.tuitionPaymentRequestId, r.request.id))
          .limit(1);
        return {
          ...r.request,
          student: {
            id: r.studentId,
            firstName: r.studentFirstName,
            lastName: r.studentLastName,
            studentId: r.studentStudentId,
            universityId: r.studentUniversityId,
            university: r.universityName ? { name: r.universityName } : null,
            user: { email: r.userEmail },
          },
          universitySemester: r.semId
            ? { id: r.semId, label: r.semLabel, academicYear: r.semAcademicYear }
            : null,
          paymentHistory: pay ?? null,
        };
      }),
    );

    res.json(result);
  } catch (err) {
    console.error("GET /requests error", err);
    res.status(500).json({ error: "Failed to fetch requests." });
  }
});

router.get("/requests/semester-labels", async (_req, res) => {
  try {
    const rows = await db
      .selectDistinct({ semesterLabel: tuitionPaymentRequests.semesterLabel })
      .from(tuitionPaymentRequests);
    const labels = rows
      .map((r) => r.semesterLabel)
      .sort((a, b) => b.localeCompare(a))
      .map((semesterLabel) => ({ semesterLabel }));
    res.json(labels);
  } catch (err) {
    console.error("GET /requests/semester-labels error", err);
    res.status(500).json({ error: "Failed to fetch semester labels." });
  }
});

router.get("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [row] = await db
      .select(requestStudentSelect)
      .from(tuitionPaymentRequests)
      .innerJoin(students, eq(tuitionPaymentRequests.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(universities, eq(students.universityId, universities.id))
      .leftJoin(
        universitySemesters,
        eq(tuitionPaymentRequests.universitySemesterId, universitySemesters.id),
      )
      .where(eq(tuitionPaymentRequests.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Request not found." });
      return;
    }

    const [pay] = await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.tuitionPaymentRequestId, id))
      .limit(1);

    const [report] = await db
      .select()
      .from(semesterReports)
      .where(eq(semesterReports.tuitionPaymentRequestId, id))
      .limit(1);

    res.json({
      ...row.request,
      student: {
        id: row.studentId,
        firstName: row.studentFirstName,
        lastName: row.studentLastName,
        studentId: row.studentStudentId,
        universityId: row.studentUniversityId,
        university: row.universityName ? { name: row.universityName } : null,
        user: { email: row.userEmail },
      },
      universitySemester: row.semId
        ? { id: row.semId, label: row.semLabel, academicYear: row.semAcademicYear }
        : null,
      semesterReport: report ?? null,
      paymentHistory: pay ?? null,
    });
  } catch (err) {
    console.error("GET /requests/:id error", err);
    res.status(500).json({ error: "Failed to fetch request." });
  }
});

const NEXT_STATUS: Record<RequestStatus, RequestStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "SUBMITTED", "REJECTED"],
  APPROVED: ["PAID", "UNDER_REVIEW", "REJECTED"],
  REJECTED: ["SUBMITTED", "UNDER_REVIEW"],
  PAID: [],
};

router.put("/requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { nextStatus, paymentDate } = req.body ?? {};

    const [request] = await db
      .select()
      .from(tuitionPaymentRequests)
      .where(eq(tuitionPaymentRequests.id, id))
      .limit(1);

    if (!request) {
      res.status(404).json({ error: "Request not found." });
      return;
    }

    const currentStatus = request.status as RequestStatus;
    const targetStatus = nextStatus as RequestStatus;

    if (currentStatus === targetStatus) {
      res.status(400).json({ error: "Request is already in that status." });
      return;
    }

    const allowed = NEXT_STATUS[currentStatus] ?? [];
    if (!allowed.includes(targetStatus)) {
      res.status(400).json({
        error: `Cannot move a request from ${currentStatus} to ${targetStatus}.`,
      });
      return;
    }

    const now = new Date();
    const patch: Record<string, unknown> = {
      status: targetStatus,
      updatedAt: now,
    };

    if (targetStatus === "UNDER_REVIEW" && !request.reviewedAt) {
      patch.reviewedAt = now;
    }
    if (targetStatus === "APPROVED") {
      if (!request.reviewedAt) patch.reviewedAt = now;
      if (!request.approvedAt) patch.approvedAt = now;
    }
    if (targetStatus === "REJECTED" && !request.rejectedAt) {
      patch.rejectedAt = now;
    }
    if (targetStatus === "PAID") {
      patch.paidAt = now;
    }
    if (targetStatus === "SUBMITTED") {
      patch.rejectedAt = null;
    }

    await db
      .update(tuitionPaymentRequests)
      .set(patch as any)
      .where(eq(tuitionPaymentRequests.id, id));

    if (targetStatus === "PAID") {
      let paidDate = now;
      if (paymentDate) {
        const parsed = new Date(`${paymentDate}T00:00:00.000Z`);
        if (!Number.isNaN(parsed.getTime())) paidDate = parsed;
      }

      const [existingPayment] = await db
        .select({ id: paymentHistory.id })
        .from(paymentHistory)
        .where(eq(paymentHistory.tuitionPaymentRequestId, id))
        .limit(1);

      if (!existingPayment) {
        await db.insert(paymentHistory).values({
          id: randomUUID(),
          studentId: request.studentId,
          tuitionPaymentRequestId: id,
          semesterLabel: request.semesterLabel,
          amountPaid: request.amountDue,
          paymentStatus: "PAID",
          paymentDate: paidDate,
          internalNotes: `Disbursed via bank transfer on ${paidDate.toISOString().split("T")[0]}.`,
          createdAt: now,
        });
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /requests/:id/status error", err);
    res.status(500).json({ error: "Failed to update request status." });
  }
});

router.patch("/requests/:id/notes", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body ?? {};

    const [existing] = await db
      .select({ id: tuitionPaymentRequests.id })
      .from(tuitionPaymentRequests)
      .where(eq(tuitionPaymentRequests.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Request not found." });
      return;
    }

    await db
      .update(tuitionPaymentRequests)
      .set({ adminNotes: (adminNotes as string) ?? null, updatedAt: new Date() } as any)
      .where(eq(tuitionPaymentRequests.id, id));

    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /requests/:id/notes error", err);
    res.status(500).json({ error: "Failed to update admin notes." });
  }
});

router.patch("/requests/:id/payment-notes", async (req, res) => {
  try {
    const { id } = req.params;
    const { internalNotes } = req.body ?? {};

    const [pay] = await db
      .select({ id: paymentHistory.id })
      .from(paymentHistory)
      .where(eq(paymentHistory.tuitionPaymentRequestId, id))
      .limit(1);

    if (!pay) {
      res.status(404).json({ error: "No payment record exists for this request yet." });
      return;
    }

    await db
      .update(paymentHistory)
      .set({ internalNotes: (internalNotes as string) ?? null } as any)
      .where(eq(paymentHistory.tuitionPaymentRequestId, id));

    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /requests/:id/payment-notes error", err);
    res.status(500).json({ error: "Failed to update payment notes." });
  }
});

export default router;
