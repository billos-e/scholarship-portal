import { UniversitiesList } from "@/components/admin/universities-list";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminUniversitiesPage() {
  await requireAdmin();

  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { students: true, semesters: true } },
    },
  });

  return (
    <UniversitiesList
      universities={universities.map((university) => ({
        id: university.id,
        name: university.name,
        city: university.city,
        country: university.country,
        studentCount: university._count.students,
        semesterCount: university._count.semesters,
        hasSummerSemester: university.hasSummerSemester,
        isActive: university.isActive,
      }))}
    />
  );
}
