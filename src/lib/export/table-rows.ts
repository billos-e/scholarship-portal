import { formatDate } from "@/lib/format";
import { REQUEST_STATUS_LABELS } from "@/lib/request-status";
import type { RequestStatus } from "@prisma/client";

import type { ExportRow } from "./spreadsheet";

type StudentExportSource = {
  firstName: string;
  lastName: string;
  studentId: string | null;
  universityName: string | null;
  degreeProgram: string | null;
  status: string;
};

type RequestExportSource = {
  semesterLabel: string;
  submittedAt: string;
  status: RequestStatus;
  student: {
    firstName: string;
    lastName: string;
    universityName: string | null;
  };
};

type UniversityExportSource = {
  name: string;
  city: string | null;
  country: string | null;
  studentCount: number;
  semesterCount: number;
  hasSummerSemester: boolean;
  isActive: boolean;
};

function formatStudentStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function studentsToExportRows(rows: StudentExportSource[]): ExportRow[] {
  return rows.map((row) => ({
    name: `${row.firstName} ${row.lastName}`,
    student_id: row.studentId,
    university: row.universityName,
    degree_program: row.degreeProgram,
    status: formatStudentStatus(row.status),
  }));
}

export function requestsToExportRows(rows: RequestExportSource[]): ExportRow[] {
  return rows.map((row) => ({
    student: `${row.student.firstName} ${row.student.lastName}`,
    university: row.student.universityName,
    semester: row.semesterLabel,
    submitted: formatDate(new Date(row.submittedAt)),
    status: REQUEST_STATUS_LABELS[row.status],
  }));
}

export function universitiesToExportRows(
  rows: UniversityExportSource[],
): ExportRow[] {
  return rows.map((row) => ({
    name: row.name,
    location: [row.city, row.country].filter(Boolean).join(", ") || null,
    students: row.studentCount,
    semesters: row.semesterCount,
    summer: row.hasSummerSemester ? "Yes" : "No",
    status: row.isActive ? "Active" : "Inactive",
  }));
}
