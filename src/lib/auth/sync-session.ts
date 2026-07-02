"use server";

import { unstable_update } from "@/auth";

export async function syncStudentSession(
  firstName: string,
  lastName: string,
): Promise<void> {
  await unstable_update({ user: { firstName, lastName } });
}
