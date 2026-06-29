import type { RequestStatus, StudentStatus } from "@prisma/client";

import { PAGE_SIZE, totalPages } from "@/lib/pagination";

export type DashboardFilterState = {
  year: string;
  university: string;
  semester: string;
};

export type RequestFilterState = {
  q: string;
  year: string;
  semester: string;
  uni: string;
  status: string;
};

export type StudentFilterState = {
  q: string;
  uni: string;
  status: string;
};

export type UniversityFilterState = {
  q: string;
  status: string;
};

export function matchesStudentQuery(
  student: {
    firstName: string;
    lastName: string;
    studentId: string | null;
  },
  q: string,
): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;

  return (
    student.firstName.toLowerCase().includes(needle) ||
    student.lastName.toLowerCase().includes(needle) ||
    (student.studentId?.toLowerCase().includes(needle) ?? false)
  );
}

export function matchesDashboardSubmission(
  request: {
    universitySemesterId: string | null;
    semesterLabel: string;
    studentUniversityId: string | null;
    semesterAcademicYear: string | null;
  },
  filters: DashboardFilterState,
): boolean {
  if (filters.semester) {
    if (request.universitySemesterId !== filters.semester) return false;
  } else if (filters.year) {
    const yearMatch =
      request.semesterAcademicYear === filters.year ||
      (request.universitySemesterId === null &&
        request.semesterLabel.includes(filters.year));
    if (!yearMatch) return false;
  }

  if (filters.university && request.studentUniversityId !== filters.university) {
    return false;
  }

  return true;
}

export function matchesActiveStudent(
  student: { universityId: string | null; status: StudentStatus },
  filters: DashboardFilterState,
): boolean {
  if (student.status !== "ACTIVE") return false;
  if (filters.university && student.universityId !== filters.university) {
    return false;
  }
  return true;
}

export function extractSemesterYear(semesterLabel: string): string | null {
  const match = semesterLabel.match(/\b(20\d{2})\b/);
  return match?.[1] ?? null;
}

export function getSemesterYears(semesterLabels: string[]): string[] {
  const years = new Set<string>();
  for (const label of semesterLabels) {
    const year = extractSemesterYear(label);
    if (year) years.add(year);
  }
  return [...years].sort((a, b) => b.localeCompare(a));
}

export function matchesRequestYear(
  semesterLabel: string,
  year: string,
): boolean {
  if (!year) return true;
  return extractSemesterYear(semesterLabel) === year || semesterLabel.includes(year);
}

export function filterRequests<
  T extends {
    semesterLabel: string;
    status: RequestStatus;
    student: {
      firstName: string;
      lastName: string;
      studentId: string | null;
      universityId: string | null;
    };
  },
>(requests: T[], filters: RequestFilterState): T[] {
  return requests.filter((request) => {
    if (filters.year && !matchesRequestYear(request.semesterLabel, filters.year)) {
      return false;
    }
    if (filters.semester && request.semesterLabel !== filters.semester) {
      return false;
    }
    if (filters.status && request.status !== filters.status) {
      return false;
    }
    if (filters.uni && request.student.universityId !== filters.uni) {
      return false;
    }
    if (!matchesStudentQuery(request.student, filters.q)) {
      return false;
    }
    return true;
  });
}

export function filterStudents<
  T extends {
    firstName: string;
    lastName: string;
    studentId: string | null;
    universityId: string | null;
    status: StudentStatus;
  },
>(students: T[], filters: StudentFilterState): T[] {
  return students.filter((student) => {
    if (filters.uni && student.universityId !== filters.uni) return false;
    if (filters.status && student.status !== filters.status) return false;
    if (!matchesStudentQuery(student, filters.q)) return false;
    return true;
  });
}

export function filterUniversities<
  T extends {
    name: string;
    city: string | null;
    country: string | null;
    isActive: boolean;
  },
>(universities: T[], filters: UniversityFilterState): T[] {
  const needle = filters.q.trim().toLowerCase();

  return universities.filter((university) => {
    if (filters.status === "active" && !university.isActive) return false;
    if (filters.status === "inactive" && university.isActive) return false;

    if (!needle) return true;

    return (
      university.name.toLowerCase().includes(needle) ||
      (university.city?.toLowerCase().includes(needle) ?? false) ||
      (university.country?.toLowerCase().includes(needle) ?? false)
    );
  });
}

export function paginateItems<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const pages = totalPages(items.length);
  const safePage = Math.min(Math.max(page, 1), pages);
  const offset = (safePage - 1) * pageSize;

  return {
    items: items.slice(offset, offset + pageSize),
    currentPage: safePage,
    totalPages: pages,
  };
}

export function countRequestsByStatus<
  T extends { status: RequestStatus },
>(requests: T[], statuses: RequestStatus[]): number[] {
  return statuses.map((status) => requests.filter((r) => r.status === status).length);
}
