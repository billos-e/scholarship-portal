import { AppShell } from "@/components/layout/app-shell";
import { requireStudent } from "@/lib/auth/session";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, student } = await requireStudent();

  return (
    <AppShell
      variant="student"
      email={user.email ?? ""}
      displayName={`${student.firstName} ${student.lastName}`}
    >
      {children}
    </AppShell>
  );
}
