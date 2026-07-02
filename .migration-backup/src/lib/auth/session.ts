import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getStudentProfileByUserId } from "@/lib/auth/student-profile";
import type { Session } from "next-auth";

/** Returns the current session user or null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Display name from session (no DB). Falls back to email local-part. */
export function sessionDisplayName(
  user: NonNullable<Session["user"]>,
): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email?.split("@")[0] ?? "User";
}

/** Ensures a user is logged in, otherwise redirects to /login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Logged-in student session only — no database round-trip. */
export async function requireStudentSession() {
  const user = await requireUser();
  if (user.role !== "STUDENT") redirect("/admin");
  return user;
}

/** Ensures the current user is an ADMIN. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/student");
  return user;
}

/** Ensures the current user is a STUDENT and returns their Student profile. */
export async function requireStudent() {
  const user = await requireStudentSession();

  const student = await getStudentProfileByUserId(user.id);

  if (!student) {
    // A STUDENT user without a profile is a data inconsistency.
    redirect("/login");
  }

  return { user, student };
}
