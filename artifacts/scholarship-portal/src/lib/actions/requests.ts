"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { RequestStatus } from "@prisma/client";

import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type RequestActionState = {
  error?: string;
  success?: boolean;
};

/**
 * Allowed status transitions for admins:
 *   SUBMITTED     -> UNDER_REVIEW | REJECTED
 *   UNDER_REVIEW  -> APPROVED | SUBMITTED | REJECTED
 *   APPROVED      -> PAID | UNDER_REVIEW | REJECTED
 *   REJECTED      -> SUBMITTED | UNDER_REVIEW
 *   PAID          -> (terminal)
 */
const NEXT_STATUS: Record<RequestStatus, RequestStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "SUBMITTED", "REJECTED"],
  APPROVED: ["PAID", "UNDER_REVIEW", "REJECTED"],
  REJECTED: ["SUBMITTED", "UNDER_REVIEW"],
  PAID: [],
};

function isAllowedTransition(from: RequestStatus, to: RequestStatus): boolean {
  return NEXT_STATUS[from]?.includes(to) ?? false;
}

function pathsToRevalidate(requestId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/student");
  revalidatePath("/student/history");
}

const transitionSchema = z.object({
  requestId: z.string().min(1, "Missing request id."),
  nextStatus: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "PAID",
    "REJECTED",
  ]),
  paymentDate: z.string().trim().optional(),
});

export async function transitionRequestStatus(
  _prev: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  await requireAdmin();

  const parsed = transitionSchema.safeParse({
    requestId: formData.get("requestId"),
    nextStatus: formData.get("nextStatus"),
    paymentDate: formData.get("paymentDate") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const request = await prisma.tuitionPaymentRequest.findUnique({
    where: { id: parsed.data.requestId },
  });
  if (!request) return { error: "Request not found." };

  const { nextStatus } = parsed.data;
  if (request.status === nextStatus) {
    return { error: "Request is already in that status." };
  }
  if (!isAllowedTransition(request.status, nextStatus)) {
    return {
      error: `Cannot move a request from ${request.status} to ${nextStatus}.`,
    };
  }

  const now = new Date();
  const updates: Parameters<typeof prisma.tuitionPaymentRequest.update>[0]["data"] = {
    status: nextStatus,
  };

  if (nextStatus === "UNDER_REVIEW" && !request.reviewedAt) {
    updates.reviewedAt = now;
  }
  if (nextStatus === "APPROVED") {
    if (!request.reviewedAt) updates.reviewedAt = now;
    if (!request.approvedAt) updates.approvedAt = now;
  }
  if (nextStatus === "REJECTED" && !request.rejectedAt) {
    updates.rejectedAt = now;
  }
  if (nextStatus === "PAID" && !request.paidAt) {
    updates.paidAt = now;
  }
  if (nextStatus === "SUBMITTED") {
    updates.rejectedAt = null;
  }

  if (nextStatus === "PAID") {
    let paymentDate = now;
    if (parsed.data.paymentDate) {
      const parsedDate = new Date(`${parsed.data.paymentDate}T00:00:00.000Z`);
      if (Number.isNaN(parsedDate.getTime())) {
        return { error: "Invalid payment date." };
      }
      paymentDate = parsedDate;
    }

    try {
      await prisma.$transaction([
        prisma.tuitionPaymentRequest.update({
          where: { id: request.id },
          data: updates,
        }),
        prisma.paymentHistory.upsert({
          where: { tuitionPaymentRequestId: request.id },
          update: {
            paymentDate,
            amountPaid: request.amountDue,
            paymentStatus: "PAID",
          },
          create: {
            studentId: request.studentId,
            tuitionPaymentRequestId: request.id,
            semesterLabel: request.semesterLabel,
            amountPaid: request.amountDue,
            paymentStatus: "PAID",
            paymentDate,
          },
        }),
      ]);
    } catch (err) {
      console.error("transitionRequestStatus (PAID) failed", err);
      return { error: "Could not mark this request as paid." };
    }
  } else {
    try {
      await prisma.tuitionPaymentRequest.update({
        where: { id: request.id },
        data: updates,
      });
    } catch (err) {
      console.error("transitionRequestStatus failed", err);
      return { error: "Could not update this request status." };
    }
  }

  pathsToRevalidate(request.id);
  return { success: true };
}

const notesSchema = z.object({
  requestId: z.string().min(1, "Missing request id."),
  adminNotes: z.string().trim().max(4000).optional(),
});

export async function updateRequestAdminNotes(
  _prev: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  await requireAdmin();

  const parsed = notesSchema.safeParse({
    requestId: formData.get("requestId"),
    adminNotes:
      ((formData.get("adminNotes") as string) ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const exists = await prisma.tuitionPaymentRequest.findUnique({
    where: { id: parsed.data.requestId },
    select: { id: true },
  });
  if (!exists) return { error: "Request not found." };

  await prisma.tuitionPaymentRequest.update({
    where: { id: parsed.data.requestId },
    data: { adminNotes: parsed.data.adminNotes ?? null },
  });

  pathsToRevalidate(parsed.data.requestId);
  return { success: true };
}

const paymentNotesSchema = z.object({
  requestId: z.string().min(1, "Missing request id."),
  internalNotes: z.string().trim().max(4000).optional(),
});

export async function updatePaymentInternalNotes(
  _prev: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  await requireAdmin();

  const parsed = paymentNotesSchema.safeParse({
    requestId: formData.get("requestId"),
    internalNotes:
      ((formData.get("internalNotes") as string) ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const payment = await prisma.paymentHistory.findUnique({
    where: { tuitionPaymentRequestId: parsed.data.requestId },
    select: { id: true },
  });
  if (!payment) return { error: "No payment record exists for this request yet." };

  await prisma.paymentHistory.update({
    where: { id: payment.id },
    data: { internalNotes: parsed.data.internalNotes ?? null },
  });

  pathsToRevalidate(parsed.data.requestId);
  return { success: true };
}
