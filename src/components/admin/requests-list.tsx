"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestStatus } from "@prisma/client";

import { SearchField } from "@/components/admin/search-field";
import { ClientPagination } from "@/components/client-pagination";
import { TableExportButton } from "@/components/export-button";
import { EmptyState } from "@/components/empty-state";
import { useNavigationLoading } from "@/components/layout/navigation-loading";
import { PageHeader } from "@/components/layout/page-header";
import { SortableTableHead } from "@/components/sortable-table-head";
import { StatusBadge } from "@/components/status-badge";
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
  countRequestsByStatus,
  filterRequests,
  getSemesterYears,
  matchesRequestYear,
  paginateItems,
  type RequestFilterState,
} from "@/lib/client-filters";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTableSort } from "@/hooks/use-table-sort";

import {
  CLIENT_REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
} from "@/lib/request-status";
import { REQUESTS_TABLE_COLUMNS } from "@/lib/export/table-columns";
import { requestsToExportRows } from "@/lib/export/table-rows";

const STATUS_VALUES: RequestStatus[] = [
  ...CLIENT_REQUEST_STATUSES,
  "REJECTED",
];

export type RequestRow = {
  id: string;
  semesterLabel: string;
  submittedAt: string;
  status: RequestStatus;
  student: {
    firstName: string;
    lastName: string;
    studentId: string | null;
    universityId: string | null;
    universityName: string | null;
  };
};

type RequestsListProps = {
  requests: RequestRow[];
  universities: { id: string; name: string }[];
  semesters: { semesterLabel: string }[];
};

const EMPTY_FILTERS: RequestFilterState = {
  q: "",
  year: "",
  semester: "",
  uni: "",
  status: "",
};

type RequestSortKey = "student" | "university" | "semester" | "submitted" | "status";

const REQUEST_SORT_ACCESSORS: Record<
  RequestSortKey,
  (row: RequestRow) => unknown
> = {
  student: (row) => `${row.student.firstName} ${row.student.lastName}`,
  university: (row) => row.student.universityName,
  semester: (row) => row.semesterLabel,
  submitted: (row) => new Date(row.submittedAt),
  status: (row) => row.status,
};

export function RequestsList({
  requests,
  universities,
  semesters,
}: RequestsListProps) {
  const router = useRouter();
  const { startLoading } = useNavigationLoading();
  const [filters, setFilters] = useState<RequestFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const years = useMemo(
    () => getSemesterYears(semesters.map((semester) => semester.semesterLabel)),
    [semesters],
  );

  const semesterOptions = useMemo(() => {
    return semesters.filter((semester) =>
      filters.year
        ? matchesRequestYear(semester.semesterLabel, filters.year)
        : true,
    );
  }, [semesters, filters.year]);

  const baseFiltered = useMemo(
    () =>
      filterRequests(requests, {
        q: filters.q,
        year: filters.year,
        semester: filters.semester,
        uni: filters.uni,
        status: "",
      }),
    [requests, filters.q, filters.year, filters.semester, filters.uni],
  );

  const filtered = useMemo(
    () => filterRequests(requests, filters),
    [requests, filters],
  );

  const { sortedItems, sortKey, sortDirection, onSort } = useTableSort<
    RequestRow,
    RequestSortKey
  >(filtered, REQUEST_SORT_ACCESSORS);

  const tabCounts = useMemo(
    () => countRequestsByStatus(baseFiltered, STATUS_VALUES),
    [baseFiltered],
  );

  const { items: paginatedRequests, currentPage, totalPages } = useMemo(
    () => paginateItems(sortedItems, page),
    [sortedItems, page],
  );

  const exportRows = useMemo(
    () => requestsToExportRows(paginatedRequests),
    [paginatedRequests],
  );

  const exportFilename = useMemo(() => {
    const stamp = new Date().toISOString().slice(0, 10);
    return `payment-requests-page-${currentPage}-${stamp}`;
  }, [currentPage]);

  useEffect(() => {
    setPage(1);
  }, [filters.q, filters.year, filters.semester, filters.uni, filters.status, sortKey, sortDirection]);

  function updateFilters(patch: Partial<RequestFilterState>) {
    setFilters((current) => {
      const next = { ...current, ...patch };
      if (patch.year !== undefined && patch.semester === undefined && next.semester) {
        if (!matchesRequestYear(next.semester, next.year)) {
          next.semester = "";
        }
      }
      return next;
    });
  }

  function openRequest(id: string) {
    startLoading();
    router.push(`/admin/requests/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Requests"
        description="Review submissions, update statuses, and record payments."
        actions={
          <TableExportButton
            columns={REQUESTS_TABLE_COLUMNS}
            rows={exportRows}
            filename={exportFilename}
            sheetName="Payment requests"
          />
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All requests</CardTitle>
          <CardDescription>
            {filtered.length} request{filtered.length === 1 ? "" : "s"} matching
            your filters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateFilters({ status: "" })}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                !filters.status
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              All ({baseFiltered.length})
            </button>
            {STATUS_VALUES.map((status, index) => (
              <button
                key={status}
                type="button"
                onClick={() => updateFilters({ status })}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  filters.status === status
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {REQUEST_STATUS_LABELS[status]} ({tabCounts[index]})
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <SearchField
              id="request-search"
              label="Search student"
              value={filters.q}
              placeholder="Name or student ID"
              onChange={(q) => updateFilters({ q })}
            />

            <div className="space-y-1 lg:w-28">
              <label
                htmlFor="request-year"
                className="text-xs font-medium text-muted-foreground"
              >
                Year
              </label>
              <NativeSelect
                id="request-year"
                value={filters.year}
                onChange={(e) => updateFilters({ year: e.target.value, semester: "" })}
              >
                <option value="">All years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1 lg:w-48">
              <label
                htmlFor="request-semester"
                className="text-xs font-medium text-muted-foreground"
              >
                Semester
              </label>
              <NativeSelect
                id="request-semester"
                value={filters.semester}
                onChange={(e) => updateFilters({ semester: e.target.value })}
              >
                <option value="">All semesters</option>
                {semesterOptions.map((semester) => (
                  <option key={semester.semesterLabel} value={semester.semesterLabel}>
                    {semester.semesterLabel}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1 lg:w-56">
              <label
                htmlFor="request-university"
                className="text-xs font-medium text-muted-foreground"
              >
                University
              </label>
              <NativeSelect
                id="request-university"
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
          </div>

          {paginatedRequests.length === 0 ? (
            <EmptyState title="No requests match your filters" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="Student"
                        sortKey="student"
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
                        label="Semester"
                        sortKey="semester"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                      <SortableTableHead
                        label="Submitted"
                        sortKey="submitted"
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
                    {paginatedRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="cursor-pointer hover:bg-muted/60"
                        onClick={() => openRequest(request.id)}
                      >
                        <TableCell className="font-medium">
                          {request.student.firstName} {request.student.lastName}
                        </TableCell>
                        <TableCell>
                          {request.student.universityName ?? "—"}
                        </TableCell>
                        <TableCell>{request.semesterLabel}</TableCell>
                        <TableCell>
                          {formatDate(new Date(request.submittedAt))}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} />
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
