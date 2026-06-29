import { RequestsList } from "@/components/admin/requests-list";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminRequestsPage() {
  await requireAdmin();

  const [requests, universities, semesters] = await Promise.all([
    prisma.tuitionPaymentRequest.findMany({
      orderBy: [{ submittedAt: "desc" }],
      include: {
        student: { include: { university: true } },
      },
    }),
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.tuitionPaymentRequest.findMany({
      distinct: ["semesterLabel"],
      orderBy: { semesterLabel: "desc" },
      select: { semesterLabel: true },
    }),
  ]);

  return (
    <RequestsList
      requests={requests.map((request) => ({
        id: request.id,
        semesterLabel: request.semesterLabel,
        submittedAt: request.submittedAt.toISOString(),
        status: request.status,
        student: {
          firstName: request.student.firstName,
          lastName: request.student.lastName,
          studentId: request.student.studentId,
          universityId: request.student.universityId,
          universityName: request.student.university?.name ?? null,
        },
      }))}
      universities={universities}
      semesters={semesters}
    />
  );
}
