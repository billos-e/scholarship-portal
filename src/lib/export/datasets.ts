import { prisma } from "@/lib/prisma";

import type { ExportRow } from "./spreadsheet";

function dateOnly(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function dateTime(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString();
}

export async function fetchStudentsExportRows(): Promise<ExportRow[]> {
  const students = await prisma.student.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      user: { select: { email: true, isActive: true } },
      university: { select: { name: true } },
      bankInformation: true,
    },
  });

  return students.map((s) => ({
    student_id: s.studentId,
    first_name: s.firstName,
    last_name: s.lastName,
    email: s.user.email,
    phone: s.phone,
    university: s.university?.name ?? null,
    degree_program: s.degreeProgram,
    year_of_study: s.yearOfStudy,
    current_semester: s.currentSemesterLabel,
    gpa: s.gpa ? s.gpa.toString() : null,
    status: s.status,
    login_enabled: s.user.isActive,
    bank_account_name: s.bankInformation?.bankAccountName ?? null,
    bank_account_number: s.bankInformation?.bankAccountNumber ?? null,
    bank_name: s.bankInformation?.bankName ?? null,
    promptpay_number: s.bankInformation?.promptpayNumber ?? null,
    created_at: dateTime(s.createdAt),
    updated_at: dateTime(s.updatedAt),
  }));
}

export async function fetchRequestsExportRows(): Promise<ExportRow[]> {
  const requests = await prisma.tuitionPaymentRequest.findMany({
    orderBy: [{ submittedAt: "desc" }],
    include: {
      student: {
        include: {
          user: { select: { email: true } },
          university: { select: { name: true } },
        },
      },
      paymentHistory: true,
    },
  });

  return requests.map((r) => ({
    request_id: r.id,
    student_id: r.student.studentId,
    first_name: r.student.firstName,
    last_name: r.student.lastName,
    email: r.student.user.email,
    university: r.student.university?.name ?? null,
    semester: r.semesterLabel,
    amount_due: r.amountDue.toString(),
    due_date: dateOnly(r.dueDate),
    status: r.status,
    submitted_at: dateTime(r.submittedAt),
    reviewed_at: dateTime(r.reviewedAt),
    approved_at: dateTime(r.approvedAt),
    paid_at: dateTime(r.paidAt),
    bank_account_name: r.bankAccountName,
    bank_account_number: r.bankAccountNumber,
    bank_name: r.bankName,
    promptpay_number: r.promptpayNumber,
    amount_paid: r.paymentHistory?.amountPaid.toString() ?? null,
    payment_date: dateOnly(r.paymentHistory?.paymentDate),
    admin_notes: r.adminNotes,
    payment_internal_notes: r.paymentHistory?.internalNotes ?? null,
  }));
}

export async function fetchReportsExportRows(): Promise<ExportRow[]> {
  const reports = await prisma.semesterReport.findMany({
    orderBy: [{ submittedAt: "desc" }],
    include: {
      student: {
        include: {
          user: { select: { email: true } },
          university: { select: { name: true } },
        },
      },
      tuitionPaymentRequest: { select: { status: true } },
    },
  });

  return reports.map((r) => ({
    report_id: r.id,
    request_id: r.tuitionPaymentRequestId,
    request_status: r.tuitionPaymentRequest.status,
    student_id: r.student.studentId,
    first_name: r.student.firstName,
    last_name: r.student.lastName,
    email: r.student.user.email,
    university: r.student.university?.name ?? null,
    semester: r.semesterLabel,
    gpa: r.gpa ? r.gpa.toString() : null,
    credits_completed: r.creditsCompleted,
    passed_all_courses: r.passedAllCourses,
    wellbeing_physical: r.wellbeingPhysical,
    wellbeing_mental: r.wellbeingMental,
    wellbeing_financial: r.wellbeingFinancial,
    wellbeing_stress: r.wellbeingStress,
    wellbeing_confidence: r.wellbeingConfidence,
    challenges: r.challenges.join("; "),
    activities: r.activities.join("; "),
    reflection_achievement: r.reflectionAchievement,
    reflection_challenge: r.reflectionChallenge,
    reflection_additional: r.reflectionAdditional,
    submitted_at: dateTime(r.submittedAt),
  }));
}

export type ExportDataset = "students" | "requests" | "reports";

export async function fetchExportRows(dataset: ExportDataset): Promise<ExportRow[]> {
  switch (dataset) {
    case "students":
      return fetchStudentsExportRows();
    case "requests":
      return fetchRequestsExportRows();
    case "reports":
      return fetchReportsExportRows();
  }
}

export const EXPORT_DATASETS: {
  id: ExportDataset;
  label: string;
  description: string;
}[] = [
  {
    id: "students",
    label: "Students",
    description: "Profiles, contact info, bank details, and account status.",
  },
  {
    id: "requests",
    label: "Payment requests",
    description: "Tuition requests with workflow status and payment history.",
  },
  {
    id: "reports",
    label: "Semester reports",
    description: "Academic results, wellbeing scores, and reflections.",
  },
];
