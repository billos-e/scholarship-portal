import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "info" | "orange";

const TONE_CLASS: Record<Tone, string> = {
  primary: "bg-brand-fuchsia-light text-primary",
  accent: "bg-brand-orange-light text-accent",
  info: "bg-info-light text-info",
  orange: "bg-brand-orange-light text-accent",
};

type QuickActionCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
};

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  tone = "primary",
  className,
}: QuickActionCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/25 hover:shadow-sm sm:p-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-[10px]",
          TONE_CLASS[tone],
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="font-heading text-base font-semibold">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
