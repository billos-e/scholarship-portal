import { fetchActiveUniversities } from "@/lib/api/universities";
import { fetchUniversitySemesters } from "@/lib/api/academic";
import { fetchStudent } from "@/lib/api/students";

import type { StudentProfileFormData } from "./student-profile";

export async function validateUniversityContext(
  data: Pick<
    StudentProfileFormData,
    "universityId" | "currentSemesterLabel" | "degreeProgram" | "gpa"
  >,
  options?: { studentId?: string },
): Promise<string | null> {
  if (!data.universityId) {
    if (data.currentSemesterLabel || data.degreeProgram) {
      return "Select a university before setting academic details.";
    }
    return null;
  }

  const universities = await fetchActiveUniversities();
  const isActiveUniversity = universities.some((u) => u.id === data.universityId);

  if (!isActiveUniversity) {
    // The university is inactive, but if it's the same one already assigned
    // to this student, allow keeping it so they can still edit the rest of
    // their profile. Only block assigning an inactive university as a new
    // (changed) selection.
    const current = options?.studentId
      ? await fetchStudent(options.studentId)
      : null;
    const isUnchangedAssignment = current?.universityId === data.universityId;
    if (!isUnchangedAssignment) {
      return "Selected university is not available.";
    }
  }

  if (data.currentSemesterLabel) {
    const currentSemesterLabel = data.currentSemesterLabel;
    const semesters = await fetchUniversitySemesters(data.universityId, true);
    const semester = semesters.find(
      (s) => s.label.toLowerCase() === currentSemesterLabel.toLowerCase(),
    );
    if (!semester) {
      return "Current semester must match an active semester for this university.";
    }
  }

  return null;
}
