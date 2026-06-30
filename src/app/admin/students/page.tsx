import { StudentsList } from "@/components/admin/students-list";
import { requireAdmin } from "@/lib/auth/session";
import { getStudentAcademicOptions } from "@/lib/student-academic-options";
import { prisma } from "@/lib/prisma";

export default async function AdminStudentsPage() {
  await requireAdmin();

  const [students, universities, academicOptions] = await Promise.all([
    prisma.student.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { university: true },
    }),
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getStudentAcademicOptions(),
  ]);

  return (
    <StudentsList
      students={students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        universityId: student.universityId,
        universityName: student.university?.name ?? null,
        degreeProgram: student.degreeProgram,
        status: student.status,
      }))}
      universities={universities}
      academicOptions={academicOptions}
    />
  );
}
