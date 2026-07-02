import { GraduationCap, Shield } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  variant?: "student" | "admin";
  size?: "sm" | "md";
  surface?: "default" | "on-admin";
  className?: string;
};

export function BrandMark({
  variant = "student",
  size = "md",
  surface = "default",
  className,
}: BrandMarkProps) {
  const Icon = variant === "admin" ? Shield : GraduationCap;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        size === "sm" ? "size-8" : "size-9",
        surface === "on-admin"
          ? "bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm"
          : "bg-primary text-primary-foreground",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-4" : "size-[18px]"} />
    </span>
  );
}
