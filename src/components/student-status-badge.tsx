import type { StudentStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONFIG: Record<StudentStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  GRADUATED: {
    label: "Graduated",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-slate-100 text-slate-600 border-slate-200",
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
