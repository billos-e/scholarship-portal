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
import { fetchStudents, type StudentRecord } from "@/lib/api/students";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";

export default function AdminStudentsPage() {
  requireAdmin();

  const [students, setStudents] = useState<StudentRecord[] | null>(null);
  const [universities, setUniversities] = useState<ActiveUniversity[]>([]);
  const [academicOptions, setAcademicOptions] =
    useState<StudentAcademicOptions>({
      semestersByUniversity: {},
      programsByUniversity: {},
    });

  useEffect(() => {
    Promise.all([
      fetchStudents(),
      fetchActiveUniversities(),
      fetchAcademicOptions(),
    ])
      .then(([loadedStudents, loadedUniversities, options]) => {
        setStudents(loadedStudents);
        setUniversities(loadedUniversities);
        setAcademicOptions(options);
      })
      .catch(() => setStudents([]));
  }, []);

  if (students === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <StudentsList
      students={students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.user.email,
        phone: student.phone,
        studentId: student.studentId,
        memberSince: student.createdAt.toISOString(),
        universityId: student.universityId,
        universityName: student.university?.name ?? null,
        degreeProgram: student.degreeProgram,
        yearOfStudy: student.yearOfStudy,
        currentSemesterLabel: student.currentSemesterLabel,
        gpa: student.gpa?.toString() ?? null,
        status: student.status,
        bankAccountName: student.bankInformation?.bankAccountName ?? null,
        bankAccountNumber: student.bankInformation?.bankAccountNumber ?? null,
        bankName: student.bankInformation?.bankName ?? null,
        promptpayNumber: student.bankInformation?.promptpayNumber ?? null,
      }))}
      universities={universities}
      academicOptions={academicOptions}
    />
  );
}
