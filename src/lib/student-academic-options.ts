import { prisma } from "@/lib/prisma";

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
  const [semesters, programRows] = await Promise.all([
    prisma.universitySemester.findMany({
      where: { isActive: true },
      orderBy: [{ startDate: "desc" }],
      select: {
        id: true,
        universityId: true,
        label: true,
        academicYear: true,
        startDate: true,
        endDate: true,
      },
    }),
    prisma.student.findMany({
      where: {
        degreeProgram: { not: null },
        universityId: { not: null },
      },
      select: { universityId: true, degreeProgram: true },
      distinct: ["universityId", "degreeProgram"],
    }),
  ]);

  const semestersByUniversity: Record<string, SemesterOption[]> = {};
  for (const semester of semesters) {
    const list = semestersByUniversity[semester.universityId] ?? [];
    list.push({
      id: semester.id,
      label: semester.label,
      academicYear: semester.academicYear,
      startDate: semester.startDate.toISOString().slice(0, 10),
      endDate: semester.endDate.toISOString().slice(0, 10),
    });
    semestersByUniversity[semester.universityId] = list;
  }

  const programSets: Record<string, Set<string>> = {};
  for (const row of programRows) {
    if (!row.universityId || !row.degreeProgram) continue;
    const set = programSets[row.universityId] ?? new Set<string>();
    set.add(row.degreeProgram);
    programSets[row.universityId] = set;
  }

  const programsByUniversity: Record<string, string[]> = {};
  for (const [universityId, set] of Object.entries(programSets)) {
    programsByUniversity[universityId] = [...set].sort((a, b) =>
      a.localeCompare(b),
    );
  }

  return { semestersByUniversity, programsByUniversity };
}
