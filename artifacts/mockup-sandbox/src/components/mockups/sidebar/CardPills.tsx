import './_group.css';

import {
  Shield,
  LayoutDashboard,
  Users,
  ClipboardList,
  Building2,
  FileUp,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/requests", label: "Payment Requests", icon: ClipboardList },
  { href: "/admin/universities", label: "Universities", icon: Building2 },
  { href: "/admin/import", label: "Import", icon: FileUp },
];

export function CardPills() {
  return (
    <div className="min-h-screen bg-background font-sans flex">
      <aside
        className="flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
        style={{ width: 260, minHeight: 700 }}
      >
        {/* Logo + title */}
        <div className="flex items-center gap-3 px-5 py-7">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Shield className="size-[18px]" />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Admin</p>
            <p className="text-[11px] text-muted-foreground">Scholarship Portal</p>
          </div>
        </div>

        {/* Nav as card pills */}
        <nav className="flex-1 space-y-2 px-3 overflow-y-auto">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = i === 2;
            return (
              <a
                key={item.href}
                href="#"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold transition-all ${
                  isActive
                    ? "bg-[#c0269a] text-white shadow-md"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  isActive ? "bg-white/15" : "bg-muted/60"
                }`}>
                  <Icon className="size-[18px]" />
                </span>
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Bottom card */}
        <div className="p-4">
          <div className="rounded-2xl border border-sidebar-border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-fuchsia-light text-primary font-semibold text-xs">
                AD
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-foreground">admin</p>
                <p className="truncate text-[11px] text-muted-foreground">Administrator</p>
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-[13px] font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <LogOut className="size-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
