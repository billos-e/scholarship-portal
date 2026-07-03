import { Breadcrumb } from "@/components/layout/breadcrumb";
import { requireStudent } from "@/lib/auth/session";
import { getActiveUniversities } from "@/lib/stub/sample-data";
import { StudentProfileEditForm } from "./student-profile-edit-form";

export default function StudentProfileEditPage() {
  const { user, student } = requireStudent();

  const universities = getActiveUniversities();
  const academicOptions = {
    semestersByUniversity: {} as Record<
      string,
      { id: string; label: string; academicYear: string; startDate: string; endDate: string }[]
    >,
    programsByUniversity: {} as Record<string, string[]>,
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "My Profile", href: "/student/profile" },
          { label: "Edit" },
        ]}
      />

      <StudentProfileEditForm
        profileHref="/student/profile"
        universities={universities}
        academicOptions={academicOptions}
        student={{
          firstName: student.firstName,
          lastName: student.lastName,
          email: user.email ?? "",
          studentId: student.studentId,
          phone: student.phone,
          universityId: student.universityId,
          degreeProgram: student.degreeProgram,
          yearOfStudy: student.yearOfStudy,
          currentSemesterLabel: student.currentSemesterLabel,
          gpa: student.gpa ? student.gpa.toString() : null,
          photoUrl: student.photoUrl,
          bankAccountName:
            student.bankInformation?.bankAccountName ?? null,
          bankAccountNumber:
            student.bankInformation?.bankAccountNumber ?? null,
          bankName: student.bankInformation?.bankName ?? null,
          promptpayNumber: student.bankInformation?.promptpayNumber ?? null,
        }}
      />
    </div>
  );
}
