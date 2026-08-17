import { apiBase, reviveDates } from "./shared";
import type { RequestCategory } from "@/lib/request-category";
import { parseRequestCategory } from "@/lib/request-category";

export type RequestStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "PAID"
  | "REJECTED";

export type RequestStudent = {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string | null;
  universityId: string | null;
  university: { name: string } | null;
  user: { email: string };
};

export type PaymentHistoryRecord = {
  id: string;
  amountPaid: string;
  paymentDate: Date;
  paymentStatus: string;
  internalNotes: string | null;
} | null;

export type SemesterReportRecord = {
  id: string;
  gpa: string | null;
  creditsCompleted: number | null;
  withdrawnFromCourses: boolean | null;
  academicComment: string | null;
  transcriptFileUrl: string | null;
  receivedAcademicExcellenceAward: boolean | null;
  receivedOtherAward: boolean | null;
  awardFileUrls: string[] | null;
  awardsComment: string | null;
  wellbeingPhysical: number | null;
  wellbeingMental: number | null;
  wellbeingFinancial: number | null;
  wellbeingStress: number | null;
  wellbeingConfidence: number | null;
  challenges: string[];
  activities: string[];
  activitiesComment: string | null;
  reflectionAchievement: string | null;
  reflectionChallenge: string | null;
  reflectionAdditional: string | null;
  reflectionOvercomeChallenge: string | null;
  reflectionMeaningfulExperience: string | null;
  reflectionProudAchievement: string | null;
  submittedAt: Date;
} | null;

export type RequestUniversitySemester = {
  id: string;
  label: string;
  academicYear: string;
} | null;

export type RequestRecord = {
  id: string;
  studentId: string;
  semesterLabel: string;
  amountDue: string;
  dueDate: Date | null;
  invoiceFileUrl: string | null;
  message: string | null;
  requestCategory: RequestCategory;
  qrPaymentImageUrl: string | null;
  status: RequestStatus;
  adminNotes: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
  universitySemesterId: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  approvedAt: Date | null;
  paidAt: Date | null;
  rejectedAt: Date | null;
  updatedAt: Date;
  student: RequestStudent;
  universitySemester: RequestUniversitySemester;
  paymentHistory: PaymentHistoryRecord;
};

export type RequestDetail = RequestRecord & {
  semesterReport: SemesterReportRecord;
};

const requestDateKeys: (keyof RequestRecord)[] = [
  "dueDate",
  "submittedAt",
  "reviewedAt",
  "approvedAt",
  "paidAt",
  "rejectedAt",
  "updatedAt",
];

function reviveRequest<T extends RequestRecord>(r: T): T {
  reviveDates(r, requestDateKeys);
  if (r.paymentHistory) reviveDates(r.paymentHistory, ["paymentDate"]);
  r.requestCategory = parseRequestCategory(r.requestCategory) ?? "TUITION";
  return r;
}

export async function fetchRequests(): Promise<RequestRecord[]> {
  const res = await fetch(`${apiBase}/api/requests`);
  if (!res.ok) throw new Error("Failed to fetch requests");
  const data = (await res.json()) as RequestRecord[];
  return data.map(reviveRequest);
}

export async function fetchRequest(id: string): Promise<RequestDetail | null> {
  const res = await fetch(`${apiBase}/api/requests/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch request");
  const data = (await res.json()) as RequestDetail;
  reviveRequest(data);
  if (data.semesterReport) {
    reviveDates(data.semesterReport, ["submittedAt"]);
    data.semesterReport.receivedAcademicExcellenceAward ??= null;
    data.semesterReport.receivedOtherAward ??= null;
    data.semesterReport.awardFileUrls = Array.isArray(
      data.semesterReport.awardFileUrls,
    )
      ? data.semesterReport.awardFileUrls
      : null;
    data.semesterReport.awardsComment ??= null;
    data.semesterReport.reflectionOvercomeChallenge ??= null;
    data.semesterReport.reflectionMeaningfulExperience ??= null;
    data.semesterReport.reflectionProudAchievement ??= null;
    data.semesterReport.reflectionAchievement ??= null;
    data.semesterReport.reflectionChallenge ??= null;
    data.semesterReport.reflectionAdditional ??= null;
  }
  return data;
}

export async function fetchSemesterLabels(): Promise<string[]> {
  const res = await fetch(`${apiBase}/api/requests/semester-labels`);
  if (!res.ok) throw new Error("Failed to fetch semester labels");
  const data = (await res.json()) as { semesterLabel: string }[];
  return data.map((r) => r.semesterLabel);
}
