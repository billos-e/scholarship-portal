import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { requireStudent } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { student } = await requireStudent();

  const requests = await prisma.tuitionPaymentRequest.findMany({
    where: { studentId: student.id },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description="Your past semester submissions and their statuses."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <aside className="space-y-1 rounded-lg border bg-card p-2 lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          {requests.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No submissions yet.
            </p>
          ) : (
            requests.map((request) => (
              <Link
                key={request.id}
                href={`/student/history/${request.id}`}
                className={cn(
                  "block rounded-md px-3 py-2.5 transition-colors hover:bg-muted",
                )}
              >
                <p className="font-medium text-sm">{request.semesterLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(request.amountDue.toString())} ·{" "}
                  {formatDate(request.submittedAt)}
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={request.status} />
                </div>
              </Link>
            ))
          )}
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
