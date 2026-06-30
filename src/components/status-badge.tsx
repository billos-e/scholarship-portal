import type { RequestStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS_LABELS } from "@/lib/request-status";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<RequestStatus, string> = {
  SUBMITTED: "border-border bg-muted text-muted-foreground",
  UNDER_REVIEW: "border-warning/30 bg-warning-light text-warning",
  APPROVED: "border-info/30 bg-info-light text-info",
  PAID: "border-success/30 bg-success-light text-success",
  REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_CLASS[status])}
    >
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}
