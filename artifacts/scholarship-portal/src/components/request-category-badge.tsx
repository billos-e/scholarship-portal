import type { RequestCategory } from "@/lib/request-category";
import { REQUEST_CATEGORY_LABELS } from "@/lib/request-category";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_CLASS: Record<RequestCategory, string> = {
  TUITION: "border-primary/25 bg-brand-fuchsia-light text-primary",
  LIVING_EXPENSES: "border-accent/25 bg-brand-orange-light text-accent",
  STUDY_ABROAD_INTERNSHIP: "border-info/30 bg-info-light text-info",
  EMERGENCY_AID: "border-warning/30 bg-warning-light text-warning",
};

export function RequestCategoryBadge({
  category,
  className,
}: {
  category: RequestCategory;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", CATEGORY_CLASS[category], className)}
    >
      {REQUEST_CATEGORY_LABELS[category]}
    </Badge>
  );
}
