"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, GraduationCap, UserX, Users } from "lucide-react";
import type { StudentStatus } from "@prisma/client";

import { SearchField } from "@/components/admin/search-field";
import { ClientPagination } from "@/components/client-pagination";
import { TableExportButton } from "@/components/export-button";
import { EmptyState } from "@/components/empty-state";
import { useNavigationLoading } from "@/components/layout/navigation-loading";
import { PageHeader } from "@/components/layout/page-header";
import { SortableTableHead } from "@/components/sortable-table-head";
import { StudentStatusBadge } from "@/components/student-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  filterStudents,
  paginateItems,
  type StudentFilterState,
} from "@/lib/client-filters";
import { STUDENTS_TABLE_COLUMNS } from "@/lib/export/table-columns";
import { studentsToExportRows } from "@/lib/export/table-rows";
import { useTableSort } from "@/hooks/use-table-sort";
import { cn } from "@/lib/utils";
import { StudentCreateDialog } from "@/app/admin/students/student-create-dialog";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";

const STATUS_VALUES: StudentStatus[] = ["ACTIVE", "GRADUATED", "INACTIVE"];

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

type StudentSortKey =
  | "name"
  | "studentId"
  | "university"
  | "program"
  | "status";

const STUDENT_SORT_ACCESSORS: Record<
  StudentSortKey,
  (row: StudentRow) => unknown
> = {
  name: (row) => `${row.firstName} ${row.lastName}`,
  studentId: (row) => row.studentId,
  university: (row) => row.universityName,
  program: (row) => row.degreeProgram,
  status: (row) => row.status,
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
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          toneClass,
        )}
      >
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-heading text-xl font-bold leading-none tracking-tight">
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
          "flex min-w-0 w-full items-center gap-3 rounded-xl border px-4 py-3 shadow-sm text-left transition-colors",
          active
            ? "border-warning bg-warning/5 ring-1 ring-warning/40"
            : "border-border/70 bg-card hover:bg-muted/30 hover:border-border",
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
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

  const { sortedItems, sortKey, sortDirection, onSort } = useTableSort<
    StudentRow,
    StudentSortKey
  >(
    filtered,
    STUDENT_SORT_ACCESSORS,
    { key: "name", direction: "asc" },
  );

  const { items: paginatedStudents, currentPage, totalPages } = useMemo(
    () => paginateItems(sortedItems, page),
    [sortedItems, page],
  );

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
  }, [filters.q, filters.uni, filters.program, filters.status, sortKey, sortDirection]);

  function updateFilters(patch: Partial<StudentFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function openStudent(id: string) {
    startLoading();
    router.push(`/admin/students/${id}`);
  }

  const hasActiveFilters =
    Boolean(filters.q) ||
    Boolean(filters.uni) ||
    Boolean(filters.program) ||
    Boolean(filters.status) ||
    filters.incompleteProfile;

  return (
    <div className="space-y-6">
      <PageHeader
        variant="admin"
        title="Students"
        description="Search, create, and manage scholarship student accounts."
        actions={
          <>
            <TableExportButton
              columns={STUDENTS_TABLE_COLUMNS}
              rows={exportRows}
              filename={exportFilename}
              sheetName="Students"
            />
            <StudentCreateDialog
              universities={universities}
              academicOptions={academicOptions}
            />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
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
          onClick={() => updateFilters({ incompleteProfile: !filters.incompleteProfile })}
          active={filters.incompleteProfile}
        />
      </div>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle>Directory</CardTitle>
          <CardDescription>
            {filtered.length} student{filtered.length === 1 ? "" : "s"}
            {hasActiveFilters ? " match your filters" : " in the roster"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-xs">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Refine results
            </p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <SearchField
                id="student-search"
                label="Search"
                value={filters.q}
                placeholder="Name or student ID"
                onChange={(q) => updateFilters({ q })}
              />

              <div className="space-y-1 lg:w-52">
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

              <div className="space-y-1 lg:w-52">
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

              <div className="space-y-1 lg:w-40">
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

          {paginatedStudents.length === 0 ? (
            <EmptyState title="No students match your filters" />
          ) : (
            <>
              <div className="space-y-2 md:hidden">
                {paginatedStudents.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => openStudent(student.id)}
                    className="group w-full rounded-xl border border-border/80 bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/25 hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {student.studentId ?? "No student ID"}
                        </p>
                      </div>
                      <StudentStatusBadge status={student.status} />
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p className="truncate">
                        {student.universityName ?? "No university"}
                      </p>
                      <p className="truncate text-xs">
                        {student.degreeProgram ?? "No program"}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      View profile
                      <ChevronRight className="size-3.5" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-xl border border-border/70 md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <SortableTableHead
                        label="Name"
                        sortKey="name"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                      <SortableTableHead
                        label="Student ID"
                        sortKey="studentId"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                      <SortableTableHead
                        label="University"
                        sortKey="university"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                      <SortableTableHead
                        label="Program"
                        sortKey="program"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                      <SortableTableHead
                        label="Status"
                        sortKey="status"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                        onClick={() => openStudent(student.id)}
                      >
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.studentId ?? "—"}
                        </TableCell>
                        <TableCell>{student.universityName ?? "—"}</TableCell>
                        <TableCell>{student.degreeProgram ?? "—"}</TableCell>
                        <TableCell>
                          <StudentStatusBadge status={student.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <ClientPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
