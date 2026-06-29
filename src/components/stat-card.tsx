import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "info";

const TONE_CLASS: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  info: "bg-info-light text-info",
};

type StatCardProps = {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  tone?: Tone;
  className?: string;
};

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = "primary",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="flex items-start gap-4 py-5">
        {Icon ? (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              TONE_CLASS[tone],
            )}
          >
            <Icon className="size-5" />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {subtext ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtext}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
