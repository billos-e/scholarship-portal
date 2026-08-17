import type { BankInformation, RequestStatus, Student } from "@prisma/client";

import { REQUEST_STATUS_LABELS } from "@/lib/request-status";
import {
  REQUEST_CATEGORY_LABELS,
  type RequestCategory,
} from "@/lib/request-category";
import { fetchStudent } from "@/lib/api/students";

/** Terminal statuses — student may start a new submission of that category when all of its requests are in one of these. */
export const TERMINAL_REQUEST_STATUSES: RequestStatus[] = ["PAID", "REJECTED"];

/** Active pipeline statuses — block a new request of the same category while one exists. */
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
  requestCategory: RequestCategory;
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
  category?: RequestCategory,
): Promise<OpenRequestSummary | null> {
  const student = await fetchStudent(studentId);
  if (!student) return null;
  const request = student.tuitionPaymentRequests.find((r) => {
    if (!BLOCKING_REQUEST_STATUSES.includes(r.status)) return false;
    if (category && r.requestCategory !== category) return false;
    return true;
  });
  if (!request) return null;
  return {
    id: request.id,
    semesterLabel: request.semesterLabel,
    status: request.status,
    requestCategory: request.requestCategory,
  };
}

export async function findDuplicateSemesterSubmission(
  studentId: string,
  opts: {
    universitySemesterId?: string;
    semesterLabel?: string;
    requestCategory?: RequestCategory;
  },
): Promise<OpenRequestSummary | null> {
  const student = await fetchStudent(studentId);
  if (!student) return null;

  const match = student.tuitionPaymentRequests.find((r) => {
    if (r.status === "REJECTED") return false;
    if (opts.requestCategory && r.requestCategory !== opts.requestCategory) {
      return false;
    }
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
    requestCategory: match.requestCategory,
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
  const categoryLabel =
    REQUEST_CATEGORY_LABELS[request.requestCategory].toLowerCase();
  return `You already have an active ${categoryLabel} submission for ${request.semesterLabel} (${statusLabel}). Wait until it is paid or rejected before starting another ${categoryLabel} request.`;
}

export function duplicateSemesterMessage(
  semesterLabel: string,
  category?: RequestCategory,
): string {
  const categoryLabel = category
    ? REQUEST_CATEGORY_LABELS[category].toLowerCase()
    : "payment";
  return `You have already submitted a ${categoryLabel} request for ${semesterLabel}. You can submit again for this semester only if that request was rejected, or choose a different payment type.`;
}
