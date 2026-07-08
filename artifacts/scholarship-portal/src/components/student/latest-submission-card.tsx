import Link from "next/link";
import type { RequestStatus } from "@prisma/client";
import { ArrowRight } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { StatusStepper } from "@/components/status-stepper";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";

export type LatestSubmissionData = {
  id: string;
  semesterLabel: string;
  amountDue: string;
  submittedAt: Date;
  dueDate: Date | null;
  status: RequestStatus;
};

type LatestSubmissionCardProps = {
  request: LatestSubmissionData;
};

export function LatestSubmissionCard({ request }: LatestSubmissionCardProps) {
  const detailParts = [
    formatCurrency(request.amountDue),
    `Submitted ${formatDate(request.submittedAt)}`,
    request.dueDate ? `Due ${formatDate(request.dueDate)}` : null,
  ].filter(Boolean);

  return (
    <section className="rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {request.semesterLabel}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Latest submission
                </p>
                <StatusBadge status={request.status} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {detailParts.join(" · ")}
            </p>
          </div>

          <Button
            variant="outline"
            className="h-10 w-full shrink-0 gap-2 sm:w-auto sm:self-center"
            render={<Link href={`/student/history/${request.id}`} />}
          >
            View details
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <StatusStepper
          status={request.status}
          variant="dots"
          className="w-full max-w-none"
        />
      </div>
    </section>
  );
}
