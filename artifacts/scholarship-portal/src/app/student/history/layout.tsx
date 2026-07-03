import { HistoryRequestNav } from "@/components/student/history-request-nav";
import { PageHeader } from "@/components/layout/page-header";
import { requireStudent } from "@/lib/auth/session";
import { getRequestsForStudent } from "@/lib/stub/sample-data";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { student } = requireStudent();

  const requests = getRequestsForStudent(student.id);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Payment History"
        description="Your past semester submissions and their statuses."
        className="hidden md:flex"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-6">
        <HistoryRequestNav
          requests={requests.map((request) => ({
            id: request.id,
            semesterLabel: request.semesterLabel,
            amountDue: request.amountDue.toString(),
            submittedAt: request.submittedAt,
            status: request.status,
          }))}
        />

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
