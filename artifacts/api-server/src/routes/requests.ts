import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  db,
  tuitionPaymentRequests,
  paymentHistory,
} from "@workspace/db";

const router: IRouter = Router();

type RequestStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "PAID" | "REJECTED";

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
