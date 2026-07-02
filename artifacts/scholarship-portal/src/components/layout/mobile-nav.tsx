"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  MOBILE_ADMIN_NAV,
  MOBILE_STUDENT_NAV,
  getNavItems,
} from "@/components/layout/app-sidebar";
import { BrandMark } from "@/components/layout/brand-mark";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/initials";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  variant: "student" | "admin";
  email?: string;
  displayName?: string;
};

function getAdminPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/students")) return "Students";
  if (pathname.startsWith("/admin/requests")) return "Payment requests";
  if (pathname.startsWith("/admin/universities")) return "Universities";
  if (pathname.startsWith("/admin/import")) return "Import";
  return "Dashboard";
}

function getStudentPageTitle(pathname: string): string {
  if (pathname.startsWith("/student/profile/edit")) return "Edit profile";
  if (pathname.startsWith("/student/profile")) return "My profile";
  if (pathname.startsWith("/student/submit")) return "New submission";
  if (pathname.startsWith("/student/history")) return "Payment history";
  return "Dashboard";
}

export function MobileNav({ variant, email, displayName }: MobileNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const items = variant === "admin" ? MOBILE_ADMIN_NAV : MOBILE_STUDENT_NAV;
  const adminNavItems = getNavItems("admin");

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  function isActive(href: string) {
    if (href === "/student" || href === "/admin") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    if (!drawerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  if (variant === "admin") {
    const pageTitle = getAdminPageTitle(pathname);
    const userLabel = displayName ?? email?.split("@")[0] ?? "Admin";
    const initials = getInitials(userLabel);

    return (
      <>
        <header className="admin-mobile-header sticky top-0 z-30 border-b border-white/10 md:hidden">
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <Link
              href="/admin"
              className="flex min-w-0 items-center gap-3"
              onClick={closeDrawer}
            >
              <BrandMark variant="admin" size="sm" surface="on-admin" />
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold text-white">
                  {pageTitle}
                </p>
                <p className="truncate text-[11px] text-white/65">
                  Scholarship admin
                </p>
              </div>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              className="shrink-0 border border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </header>

        {drawerOpen ? (
          <div className="fixed inset-0 z-50 md:hidden" role="presentation">
            <button
              type="button"
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px] motion-safe:animate-in motion-safe:fade-in-0"
              aria-label="Close menu"
              onClick={closeDrawer}
            />
            <aside
              className="admin-mobile-drawer absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-sidebar-admin-border bg-sidebar-admin text-sidebar-admin-foreground shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-left-full motion-safe:duration-300"
              aria-label="Admin navigation"
            >
              <div className="flex items-center justify-between gap-3 border-b border-sidebar-admin-border px-4 py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <BrandMark variant="admin" size="sm" surface="on-admin" />
                  <div className="min-w-0">
                    <p className="truncate font-heading text-base font-bold text-white">
                      Admin panel
                    </p>
                    <p className="truncate text-[11px] text-sidebar-admin-foreground/70">
                      Scholarship portal
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="shrink-0 text-sidebar-admin-foreground hover:bg-sidebar-admin-accent/50 hover:text-white"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={cn(
                        "flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-admin-accent text-sidebar-admin-accent-foreground shadow-sm"
                          : "text-sidebar-admin-foreground/80 hover:bg-sidebar-admin-accent/40 hover:text-white",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="size-[18px] shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-sidebar-admin-border p-4">
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-sidebar-admin-border bg-black/15 p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-admin-accent text-xs font-semibold text-sidebar-admin-accent-foreground">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">
                      {userLabel}
                    </p>
                    <p className="truncate text-[11px] text-sidebar-admin-foreground/70">
                      {email ?? "Administrator"}
                    </p>
                  </div>
                </div>
                <SignOutButton
                  className="w-full justify-start gap-2 text-sidebar-admin-foreground hover:bg-sidebar-admin-accent/40 hover:text-white"
                  showLabel
                />
              </div>
            </aside>
          </div>
        ) : null}

        <nav
          className="admin-mobile-tabbar fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-card/95 backdrop-blur-md md:hidden"
          aria-label="Admin mobile navigation"
        >
          <div className="flex items-stretch justify-around px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[10px] font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active ? (
                    <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />
                  ) : null}
                  <Icon className={cn("size-5", active && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  const pageTitle = getStudentPageTitle(pathname);

  return (
    <>
      <header className="student-mobile-header sticky top-0 z-30 border-b border-border/80 bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/student" className="flex min-w-0 items-center gap-3">
            <BrandMark variant="student" size="sm" />
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-semibold text-foreground">
                {pageTitle}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Scholarship portal
              </p>
            </div>
          </Link>
        </div>
      </header>

      <nav
        className="student-mobile-tabbar fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-around px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />
                ) : null}
                <Icon className={cn("size-5", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
