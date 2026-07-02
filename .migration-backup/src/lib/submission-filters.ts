import type { Prisma } from "@prisma/client";

export type DashboardFilterParams = {
  year?: string;
  university?: string;
  semester?: string;
};

export type ParsedDashboardFilters = {
  academicYear?: string;
  universityId?: string;
  universitySemesterId?: string;
};

export function parseDashboardFilters(
  params: DashboardFilterParams,
): ParsedDashboardFilters {
  return {
    academicYear: params.year?.trim() || undefined,
    universityId: params.university?.trim() || undefined,
    universitySemesterId: params.semester?.trim() || undefined,
  };
}

export function buildSubmissionWhere(
  filters: ParsedDashboardFilters,
): Prisma.TuitionPaymentRequestWhereInput {
  const clauses: Prisma.TuitionPaymentRequestWhereInput[] = [];

  if (filters.universitySemesterId) {
    clauses.push({ universitySemesterId: filters.universitySemesterId });
  } else if (filters.academicYear) {
    clauses.push({
      OR: [
        { universitySemester: { is: { academicYear: filters.academicYear } } },
        {
          universitySemesterId: null,
          semesterLabel: { contains: filters.academicYear },
        },
      ],
    });
  }

  if (filters.universityId) {
    clauses.push({ student: { is: { universityId: filters.universityId } } });
  }

  if (clauses.length === 0) return {};
  return { AND: clauses };
}

export function buildActiveStudentWhere(
  filters: ParsedDashboardFilters,
): Prisma.StudentWhereInput {
  return {
    status: "ACTIVE",
    ...(filters.universityId ? { universityId: filters.universityId } : {}),
  };
}

export function dashboardFilterSummary(filters: ParsedDashboardFilters): string {
  const parts: string[] = [];
  if (filters.academicYear) parts.push(filters.academicYear);
  if (filters.universitySemesterId) parts.push("selected semester");
  if (parts.length === 0) return "All periods";
  return parts.join(" · ");
}
