import { apiBase, reviveDates } from "./shared";

export type StudentStatus = "ACTIVE" | "GRADUATED" | "INACTIVE";

export type BankInfo = {
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
} | null;

export type StudentRequestRow = {
  id: string;
  studentId: string;
  semesterLabel: string;
  amountDue: string;
  dueDate: Date | null;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "PAID" | "REJECTED";
  universitySemesterId: string | null;
  submittedAt: Date;
};

export type StudentRecord = {
  id: string;
  userId: string;
  studentId: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  universityId: string | null;
  degreeProgram: string | null;
  yearOfStudy: string | null;
  currentSemesterLabel: string | null;
  gpa: string | null;
  photoUrl: string | null;
  ethnicity: string | null;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
  university: { id: string; name: string } | null;
  user: { email: string; role?: string };
  bankInformation: BankInfo;
};

export type StudentDetail = StudentRecord & {
  tuitionPaymentRequests: StudentRequestRow[];
};

export type StudentListParams = {
  page?: number;
  limit?: number;
  search?: string;
  uni?: string;
  program?: string;
  status?: string;
  incompleteProfile?: boolean;
  sortKey?: string;
  sortDir?: "asc" | "desc";
};

export type StudentListResult = {
  items: StudentRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalEnrolled: number;
    active: number;
    incompleteProfile: number;
  };
};

function reviveRequest(r: StudentRequestRow): StudentRequestRow {
  return reviveDates(r, ["dueDate", "submittedAt"]);
}

function reviveStudent<T extends StudentRecord>(s: T): T {
  return reviveDates(s, ["createdAt", "updatedAt"]);
}

export async function fetchStudents(
  params: StudentListParams = {},
): Promise<StudentListResult> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.search) search.set("search", params.search);
  if (params.uni) search.set("uni", params.uni);
  if (params.program) search.set("program", params.program);
  if (params.status) search.set("status", params.status);
  if (params.incompleteProfile) search.set("incompleteProfile", "true");
  if (params.sortKey) search.set("sortKey", params.sortKey);
  if (params.sortDir) search.set("sortDir", params.sortDir);

  const qs = search.toString();
  const res = await fetch(`${apiBase}/api/students${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch students");
  const data = (await res.json()) as StudentListResult;
  data.items = data.items.map(reviveStudent);
  return data;
}

export async function fetchStudent(id: string): Promise<StudentDetail | null> {
  const res = await fetch(`${apiBase}/api/students/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch student");
  const data = (await res.json()) as StudentDetail;
  reviveStudent(data);
  data.tuitionPaymentRequests = data.tuitionPaymentRequests.map(reviveRequest);
  return data;
}
