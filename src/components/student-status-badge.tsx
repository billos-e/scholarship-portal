import type { StudentStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONFIG: Record<StudentStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "border-success/30 bg-success-light text-success",
  },
  GRADUATED: {
    label: "Graduated",
    className: "border-info/30 bg-info-light text-info",
  },
  INACTIVE: {
    label: "Inactive",
    className: "border-border bg-muted text-muted-foreground",
  },
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const c = CONFIG[status];
  return (
    <Badge variant="outline" className={cn("font-medium", c.className)}>
      {c.label}
    </Badge>
  );
}
