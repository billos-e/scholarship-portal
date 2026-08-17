"use client";

import { useEffect, useState } from "react";

import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import {
  fetchActiveUniversities,
  type ActiveUniversity,
} from "@/lib/api/universities";
import { fetchActiveSemesters, type ActiveSemester } from "@/lib/api/academic";
import { fetchStudents, type StudentRecord } from "@/lib/api/students";
import { fetchRequests, type RequestRecord } from "@/lib/api/requests";

export default function AdminDashboard() {
  requireAdmin();

  const [data, setData] = useState<{
    universities: ActiveUniversity[];
    semesters: ActiveSemester[];
    students: StudentRecord[];
    requests: RequestRecord[];
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetchActiveUniversities(),
      fetchActiveSemesters(),
      fetchStudents({ limit: 1000 }),
      fetchRequests(),
    ])
      .then(([universities, semesters, studentsResult, requests]) =>
        setData({ universities, semesters, students: studentsResult.items, requests }),
      )
      .catch(() => setData({ universities: [], semesters: [], students: [], requests: [] }));
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const { universities, semesters, students, requests } = data;

  const years = [...new Set(semesters.map((semester) => semester.academicYear))].sort(
    (a, b) => b.localeCompare(a),
  );

  return (
    <AdminDashboardView
      years={years}
      universities={universities}
      semesters={semesters}
      students={students}
      requests={requests.map((request) => ({
        id: request.id,
        semesterLabel: request.semesterLabel,
        universitySemesterId: request.universitySemesterId,
        semesterAcademicYear: request.universitySemester?.academicYear ?? null,
        studentUniversityId: request.student.universityId,
        dueDate: request.dueDate?.toISOString() ?? null,
        submittedAt: request.submittedAt.toISOString(),
        status: request.status,
        requestCategory: request.requestCategory,
        studentName: `${request.student.firstName} ${request.student.lastName}`,
        universityName: request.student.university?.name ?? "—",
        semesterName:
          request.universitySemester?.label ?? request.semesterLabel,
      }))}
    />
  );
}
