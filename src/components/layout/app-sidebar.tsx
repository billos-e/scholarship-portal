"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  GraduationCap,
  History,
  Home,
  LayoutDashboard,
  User,
  FilePlus2,
  ClipboardList,
  Users,
} from "lucide-react";

import { SignOutButton } from "@/components/layout/sign-out-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STUDENT_NAV: SidebarNavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "My Profile", icon: User },
  { href: "/student/submit", label: "New Submission", icon: FilePlus2 },
  { href: "/student/history", label: "Payment History", icon: History },
];

const ADMIN_NAV: SidebarNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/requests", label: "Payment Requests", icon: ClipboardList },
  { href: "/admin/universities", label: "Universities", icon: Building2 },
  { href: "/admin/export", label: "Export", icon: Download },
];

export function getNavItems(variant: "student" | "admin"): SidebarNavItem[] {
  return variant === "admin" ? ADMIN_NAV : STUDENT_NAV;
}

type AppSidebarProps = {
  variant: "student" | "admin";
  email: string;
  displayName?: string;
  collapsed: boolean;
  onToggle: () => void;
};

function SidebarLink({
  item,
  collapsed,
  isActive,
  variant,
}: {
  item: SidebarNavItem;
  collapsed: boolean;
  isActive: boolean;
  variant: "student" | "admin";
}) {
  const Icon = item.icon;
  const isAdmin = variant === "admin";

  const link = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-2",
        isActive
          ? isAdmin
            ? "bg-sidebar-admin-accent text-sidebar-admin-accent-foreground"
            : "bg-sidebar-accent text-sidebar-accent-foreground"
          : isAdmin
            ? "text-sidebar-admin-foreground/80 hover:bg-sidebar-admin-accent/60 hover:text-sidebar-admin-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent>{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function AppSidebar({
  variant,
  email,
  displayName,
  collapsed,
  onToggle,
}: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(variant);
  const isAdmin = variant === "admin";

  function isActive(href: string) {
    if (href === "/student" || href === "/admin") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden h-screen shrink-0 flex-col border-r transition-[width] duration-200 md:flex",
          isAdmin
            ? "border-sidebar-admin bg-sidebar-admin text-sidebar-admin-foreground"
            : "border-sidebar-border bg-sidebar text-sidebar-foreground",
          collapsed ? "w-[4.5rem]" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b px-3",
            isAdmin ? "border-sidebar-admin" : "border-sidebar-border",
          )}
        >
          <Link
            href={isAdmin ? "/admin" : "/student"}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2",
              collapsed && "justify-center",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                isAdmin
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              SP
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Scholarship Portal</p>
                <p className="truncate text-xs opacity-70">
                  {isAdmin ? "Admin" : "Student"}
                </p>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "ml-1 rounded-md p-1.5 opacity-70 transition-opacity hover:opacity-100",
                isAdmin ? "hover:bg-sidebar-admin-accent" : "hover:bg-sidebar-accent",
              )}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "rounded-md p-1.5 opacity-70 hover:opacity-100",
                isAdmin ? "hover:bg-sidebar-admin-accent" : "hover:bg-sidebar-accent",
              )}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={isActive(item.href)}
              variant={variant}
            />
          ))}
        </nav>

        <div
          className={cn(
            "border-t p-3",
            isAdmin ? "border-sidebar-admin" : "border-sidebar-border",
          )}
        >
          {!collapsed ? (
            <div className="mb-2 rounded-lg bg-black/5 p-3 dark:bg-white/5">
              <p className="truncate text-sm font-medium">
                {displayName ?? email.split("@")[0]}
              </p>
              <p className="truncate text-xs opacity-70">{email}</p>
            </div>
          ) : null}
          <SignOutButton
            className={cn(
              "w-full justify-start gap-2",
              collapsed && "justify-center px-2",
            )}
            showLabel={!collapsed}
          />
        </div>
      </aside>
    </TooltipProvider>
  );
}

export const MOBILE_STUDENT_NAV = [
  { href: "/student", label: "Home", icon: Home },
  { href: "/student/submit", label: "Submit", icon: FilePlus2 },
  { href: "/student/history", label: "History", icon: History },
  { href: "/student/profile", label: "Profile", icon: User },
] as const;

export const MOBILE_ADMIN_NAV = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/universities", label: "Universities", icon: GraduationCap },
] as const;
