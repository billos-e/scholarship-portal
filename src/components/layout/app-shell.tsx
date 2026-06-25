import Link from "next/link";

import { NavLink, type NavItem } from "@/components/layout/nav-link";
import { SignOutButton } from "@/components/layout/sign-out-button";

type AppShellProps = {
  brand: string;
  roleLabel: string;
  email: string;
  homeHref: string;
  navItems: NavItem[];
  children: React.ReactNode;
};

export function AppShell({
  brand,
  roleLabel,
  email,
  homeHref,
  navItems,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              SP
            </span>
            <span className="hidden font-semibold sm:inline">{brand}</span>
          </Link>

          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground">
            {roleLabel}
          </span>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {email}
            </span>
            <SignOutButton />
          </div>
        </div>

        <nav className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-3 pb-2">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} exact={item.href === homeHref} />
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
