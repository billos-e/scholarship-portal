import { formatDate } from "@/lib/format";
import { REQUEST_STATUS_LABELS } from "@/lib/request-status";
import {
  requestCategoryLabel,
  type RequestCategory,
} from "@/lib/request-category";
import { formatEthnicity } from "@/lib/ethnicity-options";
import { religionLabel } from "@/lib/religion";
import { scholarshipTypeLabel } from "@/lib/scholarship-type";
import type { RequestStatus } from "@prisma/client";

import type { ExportRow } from "./spreadsheet";

function formatStudentStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatExportDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function formatExportDecimal(
  value: { toString(): string } | number | string | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : Number(value.toString());
  return Number.isNaN(num) ? null : num;
}

type StudentExportSource = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  studentId: string | null;
  memberSince: string;
  universityName: string | null;
  degreeProgram: string | null;
  yearOfStudy: string | null;
  graduationYear: number | null;
  scholarshipType: string | null;
  currentSemesterLabel: string | null;
  gpa: string | null;
  religion: string | null;
  ethnicity: string[] | null;
  status: string;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
  bankAccountName2: string | null;
  bankAccountNumber2: string | null;
  bankName2: string | null;
  promptpayNumber2: string | null;
};

type RequestExportSource = {
  id: string;
  semesterLabel: string;
  requestCategory?: RequestCategory;
  amountDue: string;
  dueDate: string | null;
  submittedAt: string;
  status: RequestStatus;
  adminNotes: string | null;
  internalNotes: string | null;
  student: {
    firstName: string;
    lastName: string;
    studentId: string | null;
    universityName: string | null;
  };
};

type UniversityExportSource = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  addressLine: string | null;
  websiteUrl: string | null;
  notes: string | null;
  studentCount: number;
  hasSummerSemester: boolean;
  isActive: boolean;
};

export type UniversitySemesterExportSource = {
  id: string;
  universityId: string;
  universityName: string;
  academicYear: string;
  termCode: string;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export function studentsToExportRows(rows: StudentExportSource[]): ExportRow[] {
  return rows.map((row) => ({
    id: row.id,
    first_name: row.firstName,
    last_name: row.lastName,
    email: row.email,
    phone: row.phone,
    student_id: row.studentId,
    member_since: formatExportDate(row.memberSince),
    university: row.universityName,
    degree_program: row.degreeProgram,
    year_of_study: row.yearOfStudy,
    graduation_year: row.graduationYear,
    scholarship_type: scholarshipTypeLabel(row.scholarshipType),
    current_semester: row.currentSemesterLabel,
    gpa: row.gpa,
    religion: religionLabel(row.religion),
    ethnicity: formatEthnicity(row.ethnicity),
    status: formatStudentStatus(row.status),
    bank_account_name: row.bankAccountName,
    bank_account_number: row.bankAccountNumber,
    bank_name: row.bankName,
    promptpay_number: row.promptpayNumber,
    bank_account_name_2: row.bankAccountName2,
    bank_account_number_2: row.bankAccountNumber2,
    bank_name_2: row.bankName2,
    promptpay_number_2: row.promptpayNumber2,
  }));
}

export function requestsToExportRows(rows: RequestExportSource[]): ExportRow[] {
  return rows.map((row) => ({
    id: row.id,
    student_first_name: row.student.firstName,
    student_last_name: row.student.lastName,
    student_id: row.student.studentId,
    university: row.student.universityName,
    semester: row.semesterLabel,
    category: requestCategoryLabel(row.requestCategory),
    amount_due: formatExportDecimal(row.amountDue),
    due_date: formatExportDate(row.dueDate),
    submitted: formatDate(new Date(row.submittedAt)),
    status: REQUEST_STATUS_LABELS[row.status],
    admin_notes: row.adminNotes,
    internal_notes: row.internalNotes,
  }));
}

export function universitiesToExportRows(
  rows: UniversityExportSource[],
): ExportRow[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
    address_line: row.addressLine,
    website: row.websiteUrl,
    notes: row.notes,
    students: row.studentCount,
    summer: row.hasSummerSemester ? "Yes" : "No",
    status: row.isActive ? "Active" : "Inactive",
  }));
}

export function universitySemestersToExportRows(
  rows: UniversitySemesterExportSource[],
): ExportRow[] {
  return rows.map((row) => ({
    university_id: row.universityId,
    university_name: row.universityName,
    id: row.id,
    academic_year: row.academicYear,
    term_code: row.termCode,
    label: row.label,
    start_date: formatExportDate(row.startDate),
    end_date: formatExportDate(row.endDate),
    status: row.isActive ? "Active" : "Inactive",
  }));
}

export type UniversityDegreeProgramExportSource = {
  id: string;
  universityId: string;
  universityName: string;
  name: string;
  isActive: boolean;
};

export function degreeProgramsToExportRows(
  rows: UniversityDegreeProgramExportSource[],
): ExportRow[] {
  return rows.map((row) => ({
    university_id: row.universityId,
    university_name: row.universityName,
    id: row.id,
    name: row.name,
    status: row.isActive ? "Active" : "Inactive",
  }));
}
