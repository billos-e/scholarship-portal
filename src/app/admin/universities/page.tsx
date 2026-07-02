import { UniversitiesList } from "@/components/admin/universities-list";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminUniversitiesPage() {
  await requireAdmin();

  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
    include: {
      semesters: {
        orderBy: { startDate: "asc" },
        select: {
          id: true,
          academicYear: true,
          termCode: true,
          label: true,
          startDate: true,
          endDate: true,
          isActive: true,
        },
      },
      _count: { select: { students: true } },
    },
  });

  return (
    <UniversitiesList
      universities={universities.map((university) => ({
        id: university.id,
        name: university.name,
        city: university.city,
        country: university.country,
        addressLine: university.addressLine,
        websiteUrl: university.websiteUrl,
        notes: university.notes,
        studentCount: university._count.students,
        hasSummerSemester: university.hasSummerSemester,
        isActive: university.isActive,
        semesters: university.semesters.map((semester) => ({
          id: semester.id,
          academicYear: semester.academicYear,
          termCode: semester.termCode,
          label: semester.label,
          startDate: semester.startDate.toISOString(),
          endDate: semester.endDate.toISOString(),
          isActive: semester.isActive,
        })),
      }))}
    />
  );
}
