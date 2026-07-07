import { apiBase, reviveDates } from "./shared";

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
  passedAllCourses: boolean | null;
  transcriptFileUrl: string | null;
  wellbeingPhysical: number | null;
  wellbeingMental: number | null;
  wellbeingFinancial: number | null;
  wellbeingStress: number | null;
  wellbeingConfidence: number | null;
  challenges: string[];
  activities: string[];
  reflectionAchievement: string | null;
  reflectionChallenge: string | null;
  reflectionAdditional: string | null;
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
  createdAt: Date;
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
  "createdAt",
  "updatedAt",
];

function reviveRequest<T extends RequestRecord>(r: T): T {
  reviveDates(r, requestDateKeys);
  if (r.paymentHistory) reviveDates(r.paymentHistory, ["paymentDate"]);
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
  if (data.semesterReport) reviveDates(data.semesterReport, ["submittedAt"]);
  return data;
}

export async function fetchSemesterLabels(): Promise<string[]> {
  const res = await fetch(`${apiBase}/api/requests/semester-labels`);
  if (!res.ok) throw new Error("Failed to fetch semester labels");
  const data = (await res.json()) as { semesterLabel: string }[];
  return data.map((r) => r.semesterLabel);
}
