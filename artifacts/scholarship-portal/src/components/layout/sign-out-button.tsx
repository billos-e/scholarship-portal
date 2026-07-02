"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  showLabel?: boolean;
};

export function SignOutButton({
  className,
  showLabel = true,
}: SignOutButtonProps) {
  return (
    <form action="/api/logout" method="post">
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={cn("gap-2", className)}
      >
        <LogOut className="size-4" />
        {showLabel ? <span>Sign out</span> : null}
      </Button>
    </form>
  );
}
