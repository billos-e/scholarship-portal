import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/auth/session";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/requests", label: "Payment Requests" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/universities", label: "Universities" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AppShell
      brand="Scholarship Portal"
      roleLabel="Admin"
      email={user.email ?? ""}
      homeHref="/admin"
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
