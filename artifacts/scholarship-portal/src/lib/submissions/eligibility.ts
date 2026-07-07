import type { BankInformation, RequestStatus, Student } from "@prisma/client";

import { REQUEST_STATUS_LABELS } from "@/lib/request-status";
import { fetchStudent } from "@/lib/api/students";

/** Terminal statuses — student may start a new submission when all requests are in one of these. */
export const TERMINAL_REQUEST_STATUSES: RequestStatus[] = ["PAID", "REJECTED"];

/** Active pipeline statuses — block any new submission while one exists. */
export const BLOCKING_REQUEST_STATUSES: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
];

export type StudentForEligibility = Student & {
  bankInformation?: BankInformation | null;
};

export type ProfileField =
  | "studentId"
  | "universityId"
  | "degreeProgram"
  | "yearOfStudy"
  | "currentSemesterLabel"
  | "gpa"
  | "bankAccountName"
  | "bankAccountNumber"
  | "bankName";

export const PROFILE_FIELD_LABELS: Record<ProfileField, string> = {
  studentId: "Student ID",
  universityId: "University",
  degreeProgram: "Degree program",
  yearOfStudy: "Year of study",
  currentSemesterLabel: "Current semester",
  gpa: "GPA",
  bankAccountName: "Bank account holder",
  bankAccountNumber: "Bank account number",
  bankName: "Bank name",
};

export type OpenRequestSummary = {
  id: string;
  semesterLabel: string;
  status: RequestStatus;
};

export type SubmissionEligibility = {
  canStart: boolean;
  missingProfileFields: ProfileField[];
  openRequest: OpenRequestSummary | null;
};

export function getMissingProfileFields(
  student: StudentForEligibility,
): ProfileField[] {
  const missing: ProfileField[] = [];
  const bank = student.bankInformation;

  if (!student.studentId?.trim()) missing.push("studentId");
  if (!student.universityId) missing.push("universityId");
  if (!student.degreeProgram?.trim()) missing.push("degreeProgram");
  if (!student.yearOfStudy?.trim()) missing.push("yearOfStudy");
  if (!student.currentSemesterLabel?.trim()) {
    missing.push("currentSemesterLabel");
  }
  if (student.gpa === null || student.gpa === undefined) missing.push("gpa");
  if (!bank?.bankAccountName?.trim()) missing.push("bankAccountName");
  if (!bank?.bankAccountNumber?.trim()) missing.push("bankAccountNumber");
  if (!bank?.bankName?.trim()) missing.push("bankName");

  return missing;
}

export function isProfileCompleteForSubmission(
  student: StudentForEligibility,
): boolean {
  return getMissingProfileFields(student).length === 0;
}

export async function findOpenRequest(
  studentId: string,
): Promise<OpenRequestSummary | null> {
  const student = await fetchStudent(studentId);
  if (!student) return null;
  const request = student.tuitionPaymentRequests.find((r) =>
    BLOCKING_REQUEST_STATUSES.includes(r.status),
  );
  if (!request) return null;
  return {
    id: request.id,
    semesterLabel: request.semesterLabel,
    status: request.status,
  };
}

export async function findDuplicateSemesterSubmission(
  studentId: string,
  opts: { universitySemesterId?: string; semesterLabel?: string },
): Promise<OpenRequestSummary | null> {
  const student = await fetchStudent(studentId);
  if (!student) return null;

  const match = student.tuitionPaymentRequests.find((r) => {
    if (r.status === "REJECTED") return false;
    if (opts.universitySemesterId) {
      return r.universitySemesterId === opts.universitySemesterId;
    }
    if (opts.semesterLabel) {
      return r.semesterLabel === opts.semesterLabel;
    }
    return false;
  });

  if (!match) return null;
  return {
    id: match.id,
    semesterLabel: match.semesterLabel,
    status: match.status,
  };
}

export async function getSubmissionEligibility(
  student: StudentForEligibility,
): Promise<SubmissionEligibility> {
  const missingProfileFields = getMissingProfileFields(student);
  const openRequest = await findOpenRequest(student.id);

  return {
    canStart: missingProfileFields.length === 0 && openRequest === null,
    missingProfileFields,
    openRequest,
  };
}

export function profileIncompleteMessage(fields: ProfileField[]): string {
  const labels = fields.map((field) => PROFILE_FIELD_LABELS[field]);
  if (labels.length === 1) {
    return `Complete your profile before submitting. Missing: ${labels[0]}.`;
  }
  return `Complete your profile before submitting. Missing: ${labels.join(", ")}.`;
}

export function openRequestMessage(request: OpenRequestSummary): string {
  const statusLabel = REQUEST_STATUS_LABELS[request.status].toLowerCase();
  return `You already have an active submission for ${request.semesterLabel} (${statusLabel}). Wait until it is paid or rejected before starting another.`;
}

export function duplicateSemesterMessage(semesterLabel: string): string {
  return `You have already submitted for ${semesterLabel}. Each semester can only be submitted once unless the previous request was rejected.`;
}
