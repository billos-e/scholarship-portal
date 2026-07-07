import { cache } from "react";

import { fetchStudent, fetchStudents } from "@/lib/api/students";

export type StudentProfile = NonNullable<
  Awaited<ReturnType<typeof getStudentProfileByUserId>>
>;

/** One round-trip per request, shared across layout + page + actions. */
export const getStudentProfileByUserId = cache(async (userId: string) => {
  const students = await fetchStudents();
  const summary = students.find((s) => s.userId === userId);
  if (!summary) return null;
  return fetchStudent(summary.id);
});

export const getStudentProfileById = cache(async (studentProfileId: string) => {
  return fetchStudent(studentProfileId);
});
