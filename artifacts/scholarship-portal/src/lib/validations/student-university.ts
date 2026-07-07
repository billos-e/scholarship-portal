import { rawUniversities, rawSemesters } from "@/lib/stub/sample-data";

import type { StudentProfileFormData } from "./student-profile";

export async function validateUniversityContext(
  data: Pick<
    StudentProfileFormData,
    "universityId" | "currentSemesterLabel" | "degreeProgram" | "gpa"
  >,
  _options?: { studentId?: string },
): Promise<string | null> {
  if (!data.universityId) {
    if (data.currentSemesterLabel || data.degreeProgram) {
      return "Select a university before setting academic details.";
    }
    return null;
  }

  const university = rawUniversities.find(
    (u) => u.id === data.universityId && u.isActive,
  );
  if (!university) {
    return "Selected university is not available.";
  }

  if (data.currentSemesterLabel) {
    const semester = rawSemesters.find(
      (s) =>
        s.universityId === data.universityId &&
        s.label.toLowerCase() === data.currentSemesterLabel.toLowerCase() &&
        s.isActive,
    );
    if (!semester) {
      return "Current semester must match an active semester for this university.";
    }
  }

  return null;
}
