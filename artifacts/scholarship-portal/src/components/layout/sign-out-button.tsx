"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth/session";

type SignOutButtonProps = {
  className?: string;
  showLabel?: boolean;
};

export function SignOutButton({
  className,
  showLabel = true,
}: SignOutButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("gap-2", className)}
      onClick={logout}
    >
      <LogOut className="size-4" />
      {showLabel ? <span>Sign out</span> : null}
    </Button>
  );
}
