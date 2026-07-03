import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { requireAdmin } from "@/lib/auth/session";
import {
  getActiveSemesters,
  getActiveUniversities,
  getRequests,
  getStudents,
} from "@/lib/stub/sample-data";

export default function AdminDashboard() {
  requireAdmin();

  const universities = getActiveUniversities();
  const semesters = getActiveSemesters();
  const students = getStudents();
  const requests = getRequests();

  const years = [...new Set(semesters.map((semester) => semester.academicYear))].sort(
    (a, b) => b.localeCompare(a),
  );

  return (
    <AdminDashboardView
      years={years}
      universities={universities}
      semesters={semesters}
      students={students}
      requests={requests.map((request) => ({
        id: request.id,
        semesterLabel: request.semesterLabel,
        universitySemesterId: request.universitySemesterId,
        semesterAcademicYear: request.universitySemester?.academicYear ?? null,
        studentUniversityId: request.student.universityId,
        dueDate: request.dueDate?.toISOString() ?? null,
        submittedAt: request.submittedAt.toISOString(),
        status: request.status,
        studentName: `${request.student.firstName} ${request.student.lastName}`,
        universityName: request.student.university?.name ?? "—",
        semesterName:
          request.universitySemester?.label ?? request.semesterLabel,
      }))}
    />
  );
}
