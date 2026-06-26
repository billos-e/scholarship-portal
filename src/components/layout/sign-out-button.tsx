"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action="/api/logout" method="post">
      <Button type="submit" variant="ghost" size="sm" className="gap-2">
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </form>
  );
}
