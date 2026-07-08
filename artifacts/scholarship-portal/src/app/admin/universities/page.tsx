"use client";

import { useEffect, useState } from "react";

import { UniversitiesList } from "@/components/admin/universities-list";
import { requireAdmin } from "@/lib/auth/session";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUniversities, type UniversityListItem } from "@/lib/api/universities";

export default function AdminUniversitiesPage() {
  requireAdmin();
  const [universities, setUniversities] = useState<UniversityListItem[] | null>(null);

  useEffect(() => {
    fetchUniversities()
      .then(setUniversities)
      .catch(() => setUniversities([]));
  }, []);

  if (!universities) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

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
          startDate: semester.startDate,
          endDate: semester.endDate,
          isActive: semester.isActive,
        })),
        degreePrograms: university.degreePrograms.map((program) => ({
          id: program.id,
          name: program.name,
          isActive: program.isActive,
        })),
      }))}
    />
  );
}
