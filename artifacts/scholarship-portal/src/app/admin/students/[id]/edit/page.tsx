"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import {
  fetchActiveUniversities,
  fetchUniversity,
  type ActiveUniversity,
} from "@/lib/api/universities";
import { fetchAcademicOptions } from "@/lib/api/academic";
import { fetchStudent, type StudentDetail } from "@/lib/api/students";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";
import NotFound from "@/pages/not-found";
import { StudentEditPageForm } from "./student-edit-page-form";

export default function StudentEditPage() {
  requireAdmin();
  const { id } = useParams<{ id: string }>();

  const [student, setStudent] = useState<StudentDetail | null | undefined>(
    undefined,
  );
  const [universities, setUniversities] = useState<ActiveUniversity[]>([]);
  const [academicOptions, setAcademicOptions] =
    useState<StudentAcademicOptions>({
      semestersByUniversity: {},
      programsByUniversity: {},
    });
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    Promise.all([
      fetchStudent(id),
      fetchActiveUniversities(),
      fetchAcademicOptions(),
    ])
      .then(async ([loadedStudent, loadedUniversities, options]) => {
        let universityOptions = loadedUniversities;
        // If the student's currently assigned university has since been
        // deactivated, keep it selectable so the edit form doesn't silently
        // drop the existing assignment.
        if (
          loadedStudent?.universityId &&
          !loadedUniversities.some((u) => u.id === loadedStudent.universityId)
        ) {
          const currentUniversity = await fetchUniversity(loadedStudent.universityId);
          if (currentUniversity) {
            universityOptions = [
              ...loadedUniversities,
              { id: currentUniversity.id, name: `${currentUniversity.name} (inactive)` },
            ];
          }
        }
        setStudent(loadedStudent);
        setUniversities(universityOptions);
        setAcademicOptions(options);
      })
      .catch(() => setStudent(null));
  }, [id, refreshKey]);

  if (student === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-[36rem] w-full rounded-2xl" />
      </div>
    );
  }

  if (!student) return <NotFound />;

  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Students", href: "/admin/students" },
          { label: fullName, href: `/admin/students/${id}` },
          { label: "Edit" },
        ]}
      />

      <StudentEditPageForm
        universities={universities}
        academicOptions={academicOptions}
        onSuccess={refresh}
        student={{
          id: student.id,
          userId: student.userId,
          email: student.user.email,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          phone: student.phone,
          universityId: student.universityId,
          degreeProgram: student.degreeProgram,
          yearOfStudy: student.yearOfStudy,
          currentSemesterLabel: student.currentSemesterLabel,
          gpa: student.gpa ? student.gpa.toString() : null,
          status: student.status,
          photoUrl: student.photoUrl,
          bankAccountName:
            student.bankInformation?.bankAccountName ?? null,
          bankAccountNumber:
            student.bankInformation?.bankAccountNumber ?? null,
          bankName: student.bankInformation?.bankName ?? null,
          promptpayNumber:
            student.bankInformation?.promptpayNumber ?? null,
        }}
      />
    </div>
  );
}
