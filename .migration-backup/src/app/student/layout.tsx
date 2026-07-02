import { AppShell } from "@/components/layout/app-shell";
import {
  requireStudentSession,
  sessionDisplayName,
} from "@/lib/auth/session";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStudentSession();

  return (
    <AppShell
      variant="student"
      email={user.email ?? ""}
      displayName={sessionDisplayName(user)}
    >
      {children}
    </AppShell>
  );
}
