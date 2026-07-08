"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Filter,
  GraduationCap,
  Plus,
  UserX,
  Users,
  X,
} from "lucide-react";
import type { StudentStatus } from "@prisma/client";

import { SearchField } from "@/components/admin/search-field";
import { ClientPagination } from "@/components/client-pagination";
import { TableExportButton } from "@/components/export-button";
import { EmptyState } from "@/components/empty-state";
import { useNavigationLoading } from "@/components/layout/navigation-loading";
import { PageHeader } from "@/components/layout/page-header";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { NativeSelect } from "@/components/ui/native-select";
import {
  filterStudents,
  paginateItems,
  type StudentFilterState,
} from "@/lib/client-filters";
import { STUDENTS_TABLE_COLUMNS } from "@/lib/export/table-columns";
import { studentsToExportRows } from "@/lib/export/table-rows";
import { cn } from "@/lib/utils";
import { StudentCreateDialog } from "@/app/admin/students/student-create-dialog";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";

const STATUS_VALUES: StudentStatus[] = ["ACTIVE", "GRADUATED", "INACTIVE"];

const CARD_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#f97316",
  "#3b82f6",
];

export type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  studentId: string | null;
  memberSince: string;
  universityId: string | null;
  universityName: string | null;
  degreeProgram: string | null;
  yearOfStudy: string | null;
  currentSemesterLabel: string | null;
  gpa: string | null;
  status: StudentStatus;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
};

type StudentsListProps = {
  students: StudentRow[];
  universities: { id: string; name: string }[];
  academicOptions: StudentAcademicOptions;
};

const EMPTY_FILTERS: StudentFilterState = {
  q: "",
  uni: "",
  program: "",
  status: "",
  incompleteProfile: false,
};

function SummaryStat({
  label,
  value,
  icon: Icon,
  tone,
  onClick,
  active,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning" | "muted";
  onClick?: () => void;
  active?: boolean;
}) {
  const toneClass = {
    primary: "bg-brand-fuchsia-light text-primary",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    muted: "bg-muted text-muted-foreground",
  }[tone];

  const content = (
    <>
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          toneClass,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-heading text-2xl font-bold leading-none tracking-tight">
          {value}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex snap-start shrink-0 min-w-[176px] items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 cursor-pointer active:scale-[0.97]",
          active
            ? "border-border/70 bg-card [box-shadow:inset_0_2px_4px_0_rgb(0_0_0/0.08),inset_0_1px_2px_0_rgb(0_0_0/0.06)] scale-[0.97] translate-y-px"
            : "border-border/70 bg-card shadow-sm hover:bg-muted/30 hover:border-border",
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex snap-start shrink-0 min-w-[176px] items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3.5 shadow-sm">
      {content}
    </div>
  );
}

export function StudentsList({
  students,
  universities,
  academicOptions,
}: StudentsListProps) {
  const router = useRouter();
  const { startLoading } = useNavigationLoading();
  const [filters, setFilters] = useState<StudentFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const programs = useMemo(() => {
    const names = new Set<string>();
    for (const student of students) {
      if (student.degreeProgram) names.add(student.degreeProgram);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [students]);

  const activeCount = useMemo(
    () => students.filter((student) => student.status === "ACTIVE").length,
    [students],
  );

  const profileIncompleteCount = useMemo(
    () =>
      students.filter(
        (student) =>
          !student.studentId?.trim() ||
          !student.universityId ||
          !student.degreeProgram?.trim() ||
          !student.yearOfStudy?.trim() ||
          !student.currentSemesterLabel?.trim() ||
          student.gpa === null ||
          !student.bankAccountName?.trim() ||
          !student.bankAccountNumber?.trim() ||
          !student.bankName?.trim(),
      ).length,
    [students],
  );

  const filtered = useMemo(
    () => filterStudents(students, filters),
    [students, filters],
  );

  const sortedItems = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      ),
    [filtered],
  );

  const {
    items: paginatedStudents,
    currentPage,
    totalPages,
  } = useMemo(() => paginateItems(sortedItems, page), [sortedItems, page]);

  const exportRows = useMemo(
    () => studentsToExportRows(paginatedStudents),
    [paginatedStudents],
  );

  const exportFilename = useMemo(() => {
    const stamp = new Date().toISOString().slice(0, 10);
    return `students-page-${currentPage}-${stamp}`;
  }, [currentPage]);

  useEffect(() => {
    setPage(1);
  }, [
    filters.q,
    filters.uni,
    filters.program,
    filters.status,
    filters.incompleteProfile,
  ]);

  function updateFilters(patch: Partial<StudentFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function openStudent(id: string) {
    startLoading();
    router.push(`/admin/students/${id}`);
  }

  const activeFilterCount = [
    filters.uni,
    filters.program,
    filters.status,
    filters.incompleteProfile ? "1" : "",
  ].filter(Boolean).length;

  const hasActiveFilters =
    Boolean(filters.q) ||
    Boolean(filters.uni) ||
    Boolean(filters.program) ||
    Boolean(filters.status) ||
    filters.incompleteProfile;

  return (
    <div className="space-y-6">
      {/* Header: title + icon-only export like universities */}
      <div className="relative">
        <PageHeader
          variant="admin"
          title="Students"
          description="Search, create, and manage scholarship student accounts."
        />
        <div className="absolute top-0 right-0">
          <TableExportButton
            columns={STUDENTS_TABLE_COLUMNS}
            rows={exportRows}
            filename={exportFilename}
            sheetName="Students"
            iconOnly
          />
        </div>
      </div>

      {/* KPI strip — scrollable */}
      <div className="flex gap-3 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SummaryStat
          label="Total enrolled"
          value={students.length}
          icon={Users}
          tone="primary"
        />
        <SummaryStat
          label="Active"
          value={activeCount}
          icon={GraduationCap}
          tone="success"
        />
        <SummaryStat
          label="Profile incomplete"
          value={profileIncompleteCount}
          icon={UserX}
          tone="warning"
          onClick={() =>
            updateFilters({ incompleteProfile: !filters.incompleteProfile })
          }
          active={filters.incompleteProfile}
        />
      </div>

      {/* Search + filter toggle row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              "relative flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              filtersOpen || activeFilterCount > 0
                ? "border-primary/40 bg-primary/8 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted/50",
            )}
          >
            <Filter className="size-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="size-3.5" />
              Clear
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            {filtered.length} student{filtered.length === 1 ? "" : "s"}
            {hasActiveFilters ? " match" : ""}
          </span>
        </div>
        <SearchField
          id="student-search"
          label="Search"
          value={filters.q}
          placeholder="Name or student ID"
          onChange={(q) => updateFilters({ q })}
        />
      </div>

      {/* Collapsible filter panel */}
      {filtersOpen && (
        <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-xs">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Refine results
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="space-y-1 sm:w-52">
              <label
                htmlFor="student-university"
                className="text-xs font-medium text-muted-foreground"
              >
                University
              </label>
              <NativeSelect
                id="student-university"
                value={filters.uni}
                onChange={(e) => updateFilters({ uni: e.target.value })}
              >
                <option value="">All universities</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1 sm:w-52">
              <label
                htmlFor="student-program"
                className="text-xs font-medium text-muted-foreground"
              >
                Program
              </label>
              <NativeSelect
                id="student-program"
                value={filters.program}
                onChange={(e) => updateFilters({ program: e.target.value })}
              >
                <option value="">All programs</option>
                {programs.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1 sm:w-40">
              <label
                htmlFor="student-status"
                className="text-xs font-medium text-muted-foreground"
              >
                Status
              </label>
              <NativeSelect
                id="student-status"
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
              >
                <option value="">All statuses</option>
                {STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>
      )}

      {/* Card carousel — replaces both mobile cards and desktop table */}
      {paginatedStudents.length === 0 ? (
        <EmptyState title="No students match your filters" />
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paginatedStudents.map((student, idx) => {
              const cardColor = CARD_COLORS[idx % CARD_COLORS.length];
              const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => openStudent(student.id)}
                  className="snap-start shrink-0 w-[220px] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm text-left transition-all hover:shadow-md hover:border-border active:scale-[0.98] cursor-pointer"
                >
                  {/* Colored header with initials */}
                  <div
                    className="relative flex h-24 items-center justify-center overflow-hidden"
                    style={{ backgroundColor: cardColor }}
                  >
                    <span
                      className="font-black text-white/20 select-none pointer-events-none"
                      style={{ fontSize: "5rem", lineHeight: 1 }}
                    >
                      {initials}
                    </span>
                    {/* Status dot */}
                    <div className="absolute top-3 right-3">
                      <div
                        className={cn(
                          "size-3 rounded-full ring-1 ring-inset ring-black/20",
                          student.status === "ACTIVE"
                            ? "bg-emerald-400"
                            : student.status === "GRADUATED"
                              ? "bg-sky-400"
                              : "bg-gray-400",
                        )}
                        style={{
                          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-3.5 pb-3.5 pt-2.5 space-y-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-tight truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {student.studentId ?? "No student ID"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground truncate">
                        {student.universityName ?? "No university"}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 truncate">
                        {student.degreeProgram ?? "No program"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <StudentStatusBadge status={student.status} />
                      <ChevronRight className="size-3.5 text-muted-foreground/50" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* FAB — New Student */}
      <StudentCreateDialog
        universities={universities}
        academicOptions={academicOptions}
        trigger={
          <button
            className="fixed bottom-16 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            title="New Student"
          >
            <Plus className="size-6" />
          </button>
        }
      />
    </div>
  );
}
