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
  const [semesters, catalogPrograms, programRows] = await Promise.all([
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
    prisma.degreeProgram.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { universityId: true, name: true },
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
  for (const row of [...catalogPrograms, ...programRows]) {
    if (!row.universityId || !("name" in row ? row.name : row.degreeProgram)) {
      continue;
    }
    const programName = "name" in row ? row.name : row.degreeProgram!;
    const set = programSets[row.universityId] ?? new Set<string>();
    set.add(programName);
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
