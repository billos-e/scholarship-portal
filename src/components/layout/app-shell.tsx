"use client";

import { useCallback, useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

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
        <MobileNav variant={variant} />
        <main
          className={
            variant === "student"
              ? "min-h-0 flex-1 overflow-y-auto p-4 pb-20 md:p-8 md:pb-8"
              : "min-h-0 flex-1 overflow-y-auto p-4 md:p-8"
          }
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
