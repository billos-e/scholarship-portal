"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import {
  MOBILE_ADMIN_NAV,
  MOBILE_STUDENT_NAV,
} from "@/components/layout/app-sidebar";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  variant: "student" | "admin";
};

export function MobileNav({ variant }: MobileNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const items = variant === "admin" ? MOBILE_ADMIN_NAV : MOBILE_STUDENT_NAV;

  function isActive(href: string) {
    if (href === "/student" || href === "/admin") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (variant === "admin") {
    return (
      <>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              SP
            </span>
            <span className="font-semibold">Admin</span>
          </Link>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </Button>
        </header>

        <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Menu</DialogTitle>
            </DialogHeader>
            <nav className="flex flex-col gap-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/admin/export"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Export
              </Link>
            </nav>
            <SignOutButton className="w-full" />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
