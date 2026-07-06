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

export function Minimal() {
  return (
    <div className="min-h-screen bg-background font-sans flex">
      <aside
        className="flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
        style={{ width: 240, minHeight: 700 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-7">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-wide text-foreground">SCHOLARSHIP</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = i === 2;
            return (
              <a
                key={item.href}
                href="#"
                className={`group flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#c0269a] text-white shadow-sm"
                    : "text-sidebar-foreground/60 hover:text-foreground hover:bg-sidebar-accent/40"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`size-[18px] shrink-0 transition-colors ${isActive ? "text-white" : "text-sidebar-foreground/40 group-hover:text-foreground/70"}`} />
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto px-3 pb-4 pt-3">
          <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-fuchsia-light text-xs font-semibold text-primary">
              AD
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-foreground">admin</p>
              <p className="truncate text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/40 hover:text-foreground">
            <LogOut className="size-[18px] shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
