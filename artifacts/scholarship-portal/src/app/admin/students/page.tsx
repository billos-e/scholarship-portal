"use client";

import { useEffect, useState } from "react";

import { StudentsList } from "@/components/admin/students-list";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import {
  fetchActiveUniversities,
  type ActiveUniversity,
} from "@/lib/api/universities";
import { fetchAcademicOptions } from "@/lib/api/academic";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";

export default function AdminStudentsPage() {
  requireAdmin();

  const [ready, setReady] = useState(false);
  const [universities, setUniversities] = useState<ActiveUniversity[]>([]);
  const [academicOptions, setAcademicOptions] =
    useState<StudentAcademicOptions>({
      semestersByUniversity: {},
      programsByUniversity: {},
    });

  useEffect(() => {
    Promise.all([fetchActiveUniversities(), fetchAcademicOptions()])
      .then(([loadedUniversities, options]) => {
        setUniversities(loadedUniversities);
        setAcademicOptions(options);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <StudentsList universities={universities} academicOptions={academicOptions} />
  );
}
