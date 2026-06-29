import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "info" | "success" | "warning";

const TONE_CLASS: Record<Tone, string> = {
  primary: "bg-brand-fuchsia-light text-primary",
  accent: "bg-brand-orange-light text-accent",
  info: "bg-info-light text-info",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
};

type RequestSectionCardProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: Tone;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function RequestSectionCard({
  title,
  description,
  icon: Icon,
  tone = "primary",
  children,
  footer,
  className,
}: RequestSectionCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
              TONE_CLASS[tone],
            )}
          >
            <Icon className="size-[18px]" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <CardTitle className="font-heading text-base font-semibold">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="text-[13px] leading-relaxed">
                {description}
              </CardDescription>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
      {footer ? (
        <div className="border-t border-border/50 bg-muted/15 px-4 py-3">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
