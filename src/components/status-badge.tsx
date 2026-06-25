import type { RequestStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  SUBMITTED: {
    label: "Submitted",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  PAID: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
