import { StudentsList } from "@/components/admin/students-list";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminStudentsPage() {
  await requireAdmin();

  const [students, universities] = await Promise.all([
    prisma.student.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { university: true, user: true },
    }),
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
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
        userIsActive: student.user.isActive,
      }))}
      universities={universities}
    />
  );
}
