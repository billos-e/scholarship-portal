import { AppShell } from "@/components/layout/app-shell";
import { requireStudent } from "@/lib/auth/session";

const navItems = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/profile", label: "My Profile" },
  { href: "/student/submit", label: "New Submission" },
  { href: "/student/history", label: "History" },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireStudent();

  return (
    <AppShell
      brand="Scholarship Portal"
      roleLabel="Student"
      email={user.email ?? ""}
      homeHref="/student"
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
