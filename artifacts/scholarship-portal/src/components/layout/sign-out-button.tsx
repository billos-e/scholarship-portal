"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth/session";

type SignOutButtonProps = {
  className?: string;
  showLabel?: boolean;
  showIcon?: boolean;
};

export function SignOutButton({
  className,
  showLabel = true,
  showIcon = true,
}: SignOutButtonProps) {
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("gap-2", className)}
      onClick={logout}
    >
      {showIcon ? <LogOut className="size-4" /> : null}
      {showLabel ? <span>Sign out</span> : null}
    </Button>
  );

  if (!showLabel) {
    return (
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent>Log out</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
