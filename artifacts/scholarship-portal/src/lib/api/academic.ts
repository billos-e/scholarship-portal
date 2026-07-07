import type { StudentAcademicOptions } from "@/lib/student-academic-options";

const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

export type ActiveSemester = {
  id: string;
  label: string;
  academicYear: string;
  universityId: string;
};

export async function fetchActiveSemesters(): Promise<ActiveSemester[]> {
  const res = await fetch(`${apiBase}/api/semesters/active`);
  if (!res.ok) throw new Error("Failed to fetch semesters");
  return res.json();
}

export type UniversitySemesterRow = {
  id: string;
  universityId: string;
  academicYear: string;
  termCode: string;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export async function fetchUniversitySemesters(
  universityId: string,
  activeOnly = true,
): Promise<UniversitySemesterRow[]> {
  const res = await fetch(
    `${apiBase}/api/universities/${universityId}/semesters?activeOnly=${activeOnly}`,
  );
  if (!res.ok) throw new Error("Failed to fetch semesters");
  return res.json();
}

export async function fetchAcademicOptions(): Promise<StudentAcademicOptions> {
  const res = await fetch(`${apiBase}/api/academic-options`);
  if (!res.ok) throw new Error("Failed to fetch academic options");
  return res.json();
}
