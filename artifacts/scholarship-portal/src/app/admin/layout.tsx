import { AppShell } from "@/components/layout/app-shell";
import { ClerkAdminGuard } from "@/components/clerk-admin-guard";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AppShell
      variant="admin"
      email={user.email ?? ""}
    >
      <ClerkAdminGuard />
      {children}
    </AppShell>
  );
}
