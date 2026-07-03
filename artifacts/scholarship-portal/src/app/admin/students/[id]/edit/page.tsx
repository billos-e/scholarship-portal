import { useParams } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { requireAdmin } from "@/lib/auth/session";
import { getActiveUniversities, getStudent, getUniversities } from "@/lib/stub/sample-data";
import NotFound from "@/pages/not-found";
import { StudentEditPageForm } from "./student-edit-page-form";

export default function StudentEditPage() {
  requireAdmin();
  const { id } = useParams<{ id: string }>();

  const student = getStudent(id);
  const universities = getActiveUniversities();

  const academicOptions = {
    semestersByUniversity: {} as Record<string, {
      id: string;
      label: string;
      academicYear: string;
      startDate: string;
      endDate: string;
    }[]>,
    programsByUniversity: {} as Record<string, string[]>,
  };
  for (const uni of getUniversities()) {
    academicOptions.semestersByUniversity[uni.id] = uni.semesters
      .filter((s: { isActive: boolean }) => s.isActive)
      .map((s: {
        id: string;
        label: string;
        academicYear: string;
        startDate: Date;
        endDate: Date;
      }) => ({
        id: s.id,
        label: s.label,
        academicYear: s.academicYear,
        startDate: s.startDate.toISOString().slice(0, 10),
        endDate: s.endDate.toISOString().slice(0, 10),
      }));
    academicOptions.programsByUniversity[uni.id] = uni.degreePrograms
      .filter((p: { isActive: boolean }) => p.isActive)
      .map((p: { name: string }) => p.name);
  }

  if (!student) return <NotFound />;

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
