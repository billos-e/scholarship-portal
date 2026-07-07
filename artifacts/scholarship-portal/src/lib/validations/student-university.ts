import { fetchActiveUniversities } from "@/lib/api/universities";
import { fetchUniversitySemesters } from "@/lib/api/academic";

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

  const universities = await fetchActiveUniversities();
  const university = universities.find((u) => u.id === data.universityId);
  if (!university) {
    return "Selected university is not available.";
  }

  if (data.currentSemesterLabel) {
    const semesters = await fetchUniversitySemesters(data.universityId, true);
    const semester = semesters.find(
      (s) =>
        s.label.toLowerCase() === data.currentSemesterLabel.toLowerCase(),
    );
    if (!semester) {
      return "Current semester must match an active semester for this university.";
    }
  }

  return null;
}
