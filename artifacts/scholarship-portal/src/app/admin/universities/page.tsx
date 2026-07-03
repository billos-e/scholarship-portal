import { UniversitiesList } from "@/components/admin/universities-list";
import { requireAdmin } from "@/lib/auth/session";
import { getUniversities } from "@/lib/stub/sample-data";

export default function AdminUniversitiesPage() {
  requireAdmin();

  const universities = getUniversities();

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
        semesters: university.semesters.map((semester: any) => ({
          id: semester.id,
          academicYear: semester.academicYear,
          termCode: semester.termCode,
          label: semester.label,
          startDate: semester.startDate.toISOString(),
          endDate: semester.endDate.toISOString(),
          isActive: semester.isActive,
        })),
        degreePrograms: university.degreePrograms.map((program: any) => ({
          id: program.id,
          name: program.name,
          isActive: program.isActive,
        })),
      }))}
    />
  );
}
