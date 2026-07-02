import { prisma } from "@/lib/prisma";

import { applyColumnMapping } from "../apply-mapping";
import { getImportFields } from "../fields";
import { parseDate, parseNumber } from "../parsers";
import type {
  ColumnMapping,
  ImportCommitResult,
  ImportPreviewResult,
  ImportRowPreview,
} from "../types";

type MappedRow = { line: number; values: Record<string, string> };

type ParsedPayment = {
  line: number;
  studentEmail?: string;
  studentId?: string;
  requestId?: string;
  semesterLabel: string;
  amountPaid: number;
  paymentDate: Date;
  paymentStatus: string;
  internalNotes?: string;
};

async function resolveStudent(
  email?: string,
  studentId?: string,
): Promise<{ id: string } | null> {
  if (studentId) {
    const byId = await prisma.student.findUnique({
      where: { studentId },
      select: { id: true },
    });
    if (byId) return byId;
  }

  if (email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { student: { select: { id: true } } },
    });
    if (byEmail?.student) return byEmail.student;
  }

  return null;
}

async function findPaymentRequest(
  data: ParsedPayment,
): Promise<{
  id: string;
  studentId: string;
  semesterLabel: string;
} | null> {
  if (data.requestId) {
    return prisma.tuitionPaymentRequest.findUnique({
      where: { id: data.requestId },
      select: { id: true, studentId: true, semesterLabel: true },
    });
  }

  const student = await resolveStudent(data.studentEmail, data.studentId);
  if (!student) return null;

  return prisma.tuitionPaymentRequest.findFirst({
    where: {
      studentId: student.id,
      semesterLabel: { equals: data.semesterLabel, mode: "insensitive" },
    },
    orderBy: { submittedAt: "desc" },
    select: { id: true, studentId: true, semesterLabel: true },
  });
}

function parsePaymentRow(
  row: MappedRow,
): { ok: ParsedPayment } | { line: number; error: string } {
  const { line, values } = row;
  const studentEmail = values.student_email?.trim().toLowerCase();
  const studentId = values.student_id?.trim();
  const requestId = values.request_id?.trim();
  const semesterLabel = values.semester?.trim();

  if (!studentEmail && !studentId && !requestId) {
    return {
      line,
      error: "Provide student email, student ID, or payment request ID.",
    };
  }

  if (!semesterLabel && !requestId) {
    return { line, error: "Semester is required when request ID is not provided." };
  }

  const amountPaid = parseNumber(values.amount_paid);
  if (amountPaid == null || amountPaid <= 0) {
    return { line, error: "Amount paid must be a positive number." };
  }

  const paymentDate = parseDate(values.payment_date);
  if (!paymentDate) {
    return { line, error: "Payment date is invalid or missing." };
  }

  return {
    ok: {
      line,
      studentEmail: studentEmail || undefined,
      studentId: studentId || undefined,
      requestId: requestId || undefined,
      semesterLabel: semesterLabel || "",
      amountPaid,
      paymentDate,
      paymentStatus: (values.payment_status?.trim().toUpperCase() || "PAID"),
      internalNotes: values.internal_notes?.trim() || undefined,
    },
  };
}

export async function previewPaymentsImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportPreviewResult> {
  const fields = getImportFields("payments");
  const mapped = applyColumnMapping(rows, mapping, fields);
  const previews: ImportRowPreview[] = [];

  for (const row of mapped) {
    const parsed = parsePaymentRow(row);
    if ("error" in parsed) {
      previews.push({ line: parsed.line, status: "error", message: parsed.error });
      continue;
    }

    const data = parsed.ok;
    const messages: string[] = [];

    const request = await findPaymentRequest(data);
    if (!request) {
      previews.push({
        line: data.line,
        status: "error",
        message: data.requestId
          ? "Payment request not found."
          : "Student or payment request not found.",
      });
      continue;
    }

    const fullRequest = await prisma.tuitionPaymentRequest.findUnique({
      where: { id: request.id },
      select: {
        id: true,
        studentId: true,
        semesterLabel: true,
        status: true,
        paymentHistory: { select: { id: true } },
      },
    });

    if (!fullRequest) {
      previews.push({
        line: data.line,
        status: "error",
        message: "Payment request not found.",
      });
      continue;
    }

    if (fullRequest.paymentHistory && fullRequest.status === "PAID") {
      messages.push("Payment record exists — will update amount and notes.");
    } else if (fullRequest.paymentHistory) {
      messages.push(
        "Payment record exists — will update payment and mark request as paid.",
      );
    } else if (fullRequest.status !== "PAID") {
      messages.push("Will record payment and mark request as paid.");
    } else {
      messages.push("Will record payment.");
    }

    previews.push({
      line: data.line,
      status: messages.length > 0 ? "warning" : "valid",
      message: messages.join(" "),
      data: { ...data, resolvedRequestId: fullRequest.id, studentDbId: fullRequest.studentId },
    });
  }

  return summarize(previews);
}

export async function commitPaymentsImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportCommitResult> {
  const fields = getImportFields("payments");
  const mapped = applyColumnMapping(rows, mapping, fields);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of mapped) {
    const parsed = parsePaymentRow(row);
    if ("error" in parsed) {
      skipped++;
      errors.push(`Line ${parsed.line}: ${parsed.error}`);
      continue;
    }

    const data = parsed.ok;
    const request = await findPaymentRequest(data);

    if (!request) {
      skipped++;
      errors.push(
        `Line ${data.line}: ${data.requestId ? "payment request not found." : "student or payment request not found."}`,
      );
      continue;
    }

    const existing = await prisma.paymentHistory.findUnique({
      where: { tuitionPaymentRequestId: request.id },
    });

    try {
      await prisma.$transaction([
        prisma.tuitionPaymentRequest.update({
          where: { id: request.id },
          data: {
            status: "PAID",
            paidAt: data.paymentDate,
          },
        }),
        prisma.paymentHistory.upsert({
          where: { tuitionPaymentRequestId: request.id },
          update: {
            amountPaid: data.amountPaid,
            paymentDate: data.paymentDate,
            paymentStatus: data.paymentStatus,
            internalNotes: data.internalNotes ?? null,
          },
          create: {
            studentId: request.studentId,
            tuitionPaymentRequestId: request.id,
            semesterLabel: request.semesterLabel,
            amountPaid: data.amountPaid,
            paymentDate: data.paymentDate,
            paymentStatus: data.paymentStatus,
            internalNotes: data.internalNotes ?? null,
          },
        }),
      ]);

      if (existing) updated++;
      else created++;
    } catch {
      skipped++;
      errors.push(`Line ${data.line}: could not record payment.`);
    }
  }

  return { created, updated, skipped, errors };
}

function summarize(rows: ImportRowPreview[]): ImportPreviewResult {
  const validCount = rows.filter((r) => r.status === "valid").length;
  const warningCount = rows.filter((r) => r.status === "warning").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  return { rows, validCount, warningCount, errorCount };
}
