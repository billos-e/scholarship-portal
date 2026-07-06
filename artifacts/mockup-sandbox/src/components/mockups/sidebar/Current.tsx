import './_group.css';

import {
  Shield,
  ChevronLeft,
  LayoutDashboard,
  Users,
  ClipboardList,
  Building2,
  FileUp,
  LogOut,
} from "lucide-react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/requests", label: "Payment Requests", icon: ClipboardList },
  { href: "/admin/universities", label: "Universities", icon: Building2 },
  { href: "/admin/import", label: "Import", icon: FileUp },
];

export function Current() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <aside
        className="flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
        style={{ width: 260, minHeight: 700 }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-6">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground ring-1 ring-primary/10">
            <Shield className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-base font-bold text-foreground">Admin Panel</p>
            <p className="truncate text-[11px] text-muted-foreground">Scholarship Portal</p>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-md border border-sidebar-border p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = i === 2; // "Payment Requests" active for demo
            return (
              <a
                key={item.href}
                href="#"
                className={`flex h-11 items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#c0269a] text-white shadow-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-sidebar-border bg-muted/40 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold bg-brand-fuchsia-light text-primary">
              AD
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-foreground">admin</p>
              <p className="truncate text-[11px] text-muted-foreground">Administrator</p>
            </div>
          </div>
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="size-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
