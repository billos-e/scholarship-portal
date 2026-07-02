import { cache } from "react";

import { prisma } from "@/lib/prisma";

const studentProfileInclude = {
  university: true,
  bankInformation: true,
} as const;

export type StudentProfile = NonNullable<
  Awaited<ReturnType<typeof getStudentProfileByUserId>>
>;

/** One Prisma round-trip per request, shared across layout + page + actions. */
export const getStudentProfileByUserId = cache(async (userId: string) => {
  return prisma.student.findUnique({
    where: { userId },
    include: studentProfileInclude,
  });
});

export const getStudentProfileById = cache(async (studentProfileId: string) => {
  return prisma.student.findUnique({
    where: { id: studentProfileId },
    include: studentProfileInclude,
  });
});
