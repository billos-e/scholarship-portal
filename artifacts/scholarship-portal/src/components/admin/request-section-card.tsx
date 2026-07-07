import type { LucideIcon } from "lucide-react";
import Link from "next/link";

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
  titleHref?: string;
  description?: string;
  icon: LucideIcon;
  tone?: Tone;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
};

export function RequestSectionCard({
  title,
  titleHref,
  description,
  icon: Icon,
  tone = "primary",
  children,
  footer,
  className,
  headerAction,
}: RequestSectionCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
              TONE_CLASS[tone],
            )}
          >
            <Icon className="size-[18px]" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <CardTitle className="font-heading text-base font-semibold">
              {titleHref ? (
                <Link
                  href={titleHref}
                  className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </CardTitle>
            {description ? (
              <CardDescription className="text-[13px] leading-relaxed">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {headerAction ? (
            <div className="shrink-0 pt-0.5">{headerAction}</div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-4 sm:px-6 sm:pt-5">{children}</CardContent>
      {footer ? (
        <div className="border-t border-border/50 bg-muted/15 px-4 py-3">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
