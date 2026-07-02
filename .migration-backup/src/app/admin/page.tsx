import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  await requireAdmin();

  const [universities, semesters, students, requests] = await Promise.all([
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.universitySemester.findMany({
      where: { isActive: true },
      orderBy: [{ academicYear: "desc" }, { startDate: "desc" }],
      select: {
        id: true,
        label: true,
        academicYear: true,
        universityId: true,
      },
    }),
    prisma.student.findMany({
      select: { universityId: true, status: true },
    }),
    prisma.tuitionPaymentRequest.findMany({
      include: {
        student: { include: { university: true } },
        universitySemester: true,
      },
    }),
  ]);

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
