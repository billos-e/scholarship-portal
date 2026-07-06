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

export function Floating() {
  return (
    <div className="min-h-screen bg-background font-sans flex items-start justify-center p-6">
      <aside
        className="flex flex-col rounded-3xl border border-border/60 bg-card text-sidebar-foreground shadow-xl"
        style={{ width: 230, minHeight: 580 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Shield className="size-[18px]" />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Admin</p>
            <p className="text-[11px] text-muted-foreground">Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = i === 2;
            return (
              <a
                key={item.href}
                href="#"
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#c0269a] text-white shadow-md"
                    : "text-sidebar-foreground/60 hover:bg-muted/60 hover:text-foreground"
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
        <div className="mt-auto p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              AD
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-foreground">admin</p>
              <p className="truncate text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
          <button title="Log out" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-sidebar-foreground/60 transition-colors hover:bg-muted/40 hover:text-foreground">
            <LogOut className="size-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
