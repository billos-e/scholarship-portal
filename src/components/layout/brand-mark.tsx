import { GraduationCap, Shield } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  variant?: "student" | "admin";
  size?: "sm" | "md";
  className?: string;
};

export function BrandMark({
  variant = "student",
  size = "md",
  className,
}: BrandMarkProps) {
  const Icon = variant === "admin" ? Shield : GraduationCap;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        size === "sm" ? "size-8" : "size-9",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-4" : "size-[18px]"} />
    </span>
  );
}
