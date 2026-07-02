import { StudentsList } from "@/components/admin/students-list";
import { requireAdmin } from "@/lib/auth/session";
import { getStudentAcademicOptions } from "@/lib/student-academic-options";
import { prisma } from "@/lib/prisma";

export default async function AdminStudentsPage() {
  await requireAdmin();

  const [students, universities, academicOptions] = await Promise.all([
    prisma.student.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        university: true,
        user: { select: { email: true } },
        bankInformation: true,
      },
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
        email: student.user.email,
        phone: student.phone,
        studentId: student.studentId,
        memberSince: student.createdAt.toISOString(),
        universityId: student.universityId,
        universityName: student.university?.name ?? null,
        degreeProgram: student.degreeProgram,
        yearOfStudy: student.yearOfStudy,
        currentSemesterLabel: student.currentSemesterLabel,
        gpa: student.gpa?.toString() ?? null,
        status: student.status,
        bankAccountName: student.bankInformation?.bankAccountName ?? null,
        bankAccountNumber: student.bankInformation?.bankAccountNumber ?? null,
        bankName: student.bankInformation?.bankName ?? null,
        promptpayNumber: student.bankInformation?.promptpayNumber ?? null,
      }))}
      universities={universities}
      academicOptions={academicOptions}
    />
  );
}
