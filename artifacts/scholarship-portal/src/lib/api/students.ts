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

function reviveRequest(r: StudentRequestRow): StudentRequestRow {
  return reviveDates(r, ["dueDate", "submittedAt"]);
}

function reviveStudent<T extends StudentRecord>(s: T): T {
  return reviveDates(s, ["createdAt", "updatedAt"]);
}

export async function fetchStudents(): Promise<StudentRecord[]> {
  const res = await fetch(`${apiBase}/api/students`);
  if (!res.ok) throw new Error("Failed to fetch students");
  const data = (await res.json()) as StudentRecord[];
  return data.map(reviveStudent);
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
