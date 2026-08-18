"use client";

import { useCallback, useLayoutEffect, useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AdminNotificationTray } from "@/components/admin/notification-tray";
import { cn } from "@/lib/utils";

const COOKIE_NAME = "sidebar-collapsed";

function readCollapsedCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1] === "true";
}

function writeCollapsedCookie(collapsed: boolean) {
  document.cookie = `${COOKIE_NAME}=${collapsed}; path=/; max-age=31536000; SameSite=Lax`;
}

type AppShellProps = {
  variant: "student" | "admin";
  email: string;
  displayName?: string;
  children: React.ReactNode;
};

export function AppShell({
  variant,
  email,
  displayName,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(() =>
    typeof document !== "undefined" ? readCollapsedCookie() : false,
  );

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writeCollapsedCookie(next);
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    const prev = [document.documentElement.style.overflow, document.body.style.overflow];
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev[0];
      document.body.style.overflow = prev[1];
    };
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar
        variant={variant}
        email={email}
        displayName={displayName}
        collapsed={collapsed}
        onToggle={toggle}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <MobileNav
          variant={variant}
          email={email}
          displayName={displayName}
        />
        <main
          className={cn(
            "min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 max-md:pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:p-8",
            variant === "student" && "max-md:pb-[calc(5rem+env(safe-area-inset-bottom))]",
          )}
        >
          <div className="w-full min-w-0">{children}</div>
        </main>
      </div>
      {variant === "admin" ? <AdminNotificationTray /> : null}
    </div>
  );
}
