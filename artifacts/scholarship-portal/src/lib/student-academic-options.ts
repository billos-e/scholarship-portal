import { apiBase } from "@/lib/api/shared";

export type SemesterOption = {
  id: string;
  label: string;
  academicYear: string;
  startDate: string;
  endDate: string;
};

export type StudentAcademicOptions = {
  semestersByUniversity: Record<string, SemesterOption[]>;
  programsByUniversity: Record<string, string[]>;
};

export async function getStudentAcademicOptions(): Promise<StudentAcademicOptions> {
  const res = await fetch(`${apiBase}/api/academic-options`);
  if (!res.ok) throw new Error("Failed to fetch academic options");
  return res.json();
}
