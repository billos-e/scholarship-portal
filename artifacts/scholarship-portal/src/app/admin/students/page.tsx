import { StudentsList } from "@/components/admin/students-list";
import { requireAdmin } from "@/lib/auth/session";
import { getActiveUniversities, getStudents, getUniversities } from "@/lib/stub/sample-data";

export default function AdminStudentsPage() {
  requireAdmin();

  const students = getStudents();
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
