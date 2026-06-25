import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Returns the current session user or null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Ensures a user is logged in, otherwise redirects to /login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
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
  const user = await requireUser();
  if (user.role !== "STUDENT") redirect("/admin");

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: { university: true, bankInformation: true },
  });

  if (!student) {
    // A STUDENT user without a profile is a data inconsistency.
    redirect("/login");
  }

  return { user, student };
}
