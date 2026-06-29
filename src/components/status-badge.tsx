import type { RequestStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    className: "border-border bg-muted text-muted-foreground",
  },
  APPROVED: {
    label: "Approved",
    className: "border-info/30 bg-info-light text-info",
  },
  PAID: {
    label: "Paid",
    className: "border-success/30 bg-success-light text-success",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
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
