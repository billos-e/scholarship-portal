import { RequestsList } from "@/components/admin/requests-list";
import { requireAdmin } from "@/lib/auth/session";
import {
  getActiveUniversities,
  getDistinctSemesterLabels,
  getRequests,
} from "@/lib/stub/sample-data";

export default function AdminRequestsPage() {
  requireAdmin();

  const requests = getRequests();
  const universities = getActiveUniversities();
  const semesters = getDistinctSemesterLabels();

  return (
    <RequestsList
      requests={requests.map((request) => ({
        id: request.id,
        semesterLabel: request.semesterLabel,
        amountDue: request.amountDue.toString(),
        dueDate: request.dueDate?.toISOString() ?? null,
        submittedAt: request.submittedAt.toISOString(),
        status: request.status,
        adminNotes: request.adminNotes,
        internalNotes: request.paymentHistory?.internalNotes ?? null,
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
