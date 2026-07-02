import { prisma } from "@/lib/prisma";

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

  const university = await prisma.university.findFirst({
    where: { id: data.universityId, isActive: true },
    select: { id: true },
  });
  if (!university) {
    return "Selected university is not available.";
  }

  if (data.currentSemesterLabel) {
    const semester = await prisma.universitySemester.findFirst({
      where: {
        universityId: data.universityId,
        label: { equals: data.currentSemesterLabel, mode: "insensitive" },
        isActive: true,
      },
      select: { id: true },
    });
    if (!semester) {
      return "Current semester must match an active semester for this university.";
    }
  }

  return null;
}
