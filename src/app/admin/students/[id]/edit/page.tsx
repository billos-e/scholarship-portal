import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { requireAdmin } from "@/lib/auth/session";
import { getStudentAcademicOptions } from "@/lib/student-academic-options";
import { prisma } from "@/lib/prisma";
import { StudentEditPageForm } from "./student-edit-page-form";

export default async function StudentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [student, universities, academicOptions] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: { bankInformation: true, user: true },
    }),
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getStudentAcademicOptions(),
  ]);

  if (!student) notFound();

  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Students", href: "/admin/students" },
          { label: fullName, href: `/admin/students/${id}` },
          { label: "Edit" },
        ]}
      />

      <StudentEditPageForm
        profileHref={`/admin/students/${id}`}
        universities={universities}
        academicOptions={academicOptions}
        student={{
          id: student.id,
          userId: student.userId,
          email: student.user.email,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          phone: student.phone,
          universityId: student.universityId,
          degreeProgram: student.degreeProgram,
          yearOfStudy: student.yearOfStudy,
          currentSemesterLabel: student.currentSemesterLabel,
          gpa: student.gpa ? student.gpa.toString() : null,
          status: student.status,
          photoUrl: student.photoUrl,
          bankAccountName:
            student.bankInformation?.bankAccountName ?? null,
          bankAccountNumber:
            student.bankInformation?.bankAccountNumber ?? null,
          bankName: student.bankInformation?.bankName ?? null,
          promptpayNumber:
            student.bankInformation?.promptpayNumber ?? null,
        }}
      />
    </div>
  );
}
