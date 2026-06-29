"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { StudentStatus } from "@prisma/client";

import { SearchField } from "@/components/admin/search-field";
import { ClientPagination } from "@/components/client-pagination";
import { ExportButton } from "@/components/export-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SortableTableHead } from "@/components/sortable-table-head";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  filterStudents,
  paginateItems,
  type StudentFilterState,
} from "@/lib/client-filters";
import { useTableSort } from "@/hooks/use-table-sort";
import { StudentCreateDialog } from "@/app/admin/students/student-create-dialog";

const STATUS_VALUES: StudentStatus[] = ["ACTIVE", "GRADUATED", "INACTIVE"];

export type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string | null;
  universityId: string | null;
  universityName: string | null;
  degreeProgram: string | null;
  status: StudentStatus;
  userIsActive: boolean;
};

type StudentsListProps = {
  students: StudentRow[];
  universities: { id: string; name: string }[];
};

const EMPTY_FILTERS: StudentFilterState = {
  q: "",
  uni: "",
  status: "",
};

type StudentSortKey =
  | "name"
  | "studentId"
  | "university"
  | "program"
  | "status"
  | "access";

const STUDENT_SORT_ACCESSORS: Record<
  StudentSortKey,
  (row: StudentRow) => unknown
> = {
  name: (row) => `${row.firstName} ${row.lastName}`,
  studentId: (row) => row.studentId,
  university: (row) => row.universityName,
  program: (row) => row.degreeProgram,
  status: (row) => row.status,
  access: (row) => row.userIsActive,
};

export function StudentsList({ students, universities }: StudentsListProps) {
  const [filters, setFilters] = useState<StudentFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [filters.q, filters.uni, filters.status, sortKey, sortDirection]);

  function updateFilters(patch: Partial<StudentFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Search, create, and manage student accounts."
        actions={
          <>
            <ExportButton
              dataset="students"
              params={{
                q: filters.q,
                uni: filters.uni,
                status: filters.status,
              }}
            />
            <StudentCreateDialog universities={universities} />
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All students</CardTitle>
          <CardDescription>
            {filtered.length} matching student{filtered.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {paginatedStudents.length === 0 ? (
            <EmptyState title="No students match your filters" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                      <SortableTableHead
                        label="Access"
                        sortKey="access"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {student.firstName} {student.lastName}
                          </Link>
                        </TableCell>
                        <TableCell>{student.studentId ?? "—"}</TableCell>
                        <TableCell>{student.universityName ?? "—"}</TableCell>
                        <TableCell>{student.degreeProgram ?? "—"}</TableCell>
                        <TableCell>
                          <StudentStatusBadge status={student.status} />
                        </TableCell>
                        <TableCell>
                          {student.userIsActive ? (
                            <Badge
                              variant="outline"
                              className="border-success/30 bg-success-light text-success"
                            >
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            render={
                              <Link href={`/admin/students/${student.id}`} />
                            }
                          >
                            <Eye />
                            View
                          </Button>
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
