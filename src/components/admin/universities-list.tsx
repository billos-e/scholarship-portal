"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SearchField } from "@/components/admin/search-field";
import { ClientPagination } from "@/components/client-pagination";
import { TableExportButton } from "@/components/export-button";
import { EmptyState } from "@/components/empty-state";
import { useNavigationLoading } from "@/components/layout/navigation-loading";
import { PageHeader } from "@/components/layout/page-header";
import { SortableTableHead } from "@/components/sortable-table-head";
import { Badge } from "@/components/ui/badge";
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
import { UniversityDialog } from "@/app/admin/universities/university-dialog";
import {
  filterUniversities,
  paginateItems,
  type UniversityFilterState,
} from "@/lib/client-filters";
import {
  UNIVERSITIES_TABLE_COLUMNS,
  UNIVERSITY_SEMESTERS_TABLE_COLUMNS,
} from "@/lib/export/table-columns";
import {
  universitiesToExportRows,
  universitySemestersToExportRows,
} from "@/lib/export/table-rows";
import { useTableSort } from "@/hooks/use-table-sort";

export type UniversityRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  addressLine: string | null;
  websiteUrl: string | null;
  notes: string | null;
  studentCount: number;
  hasSummerSemester: boolean;
  isActive: boolean;
  semesters: {
    id: string;
    academicYear: string;
    termCode: string;
    label: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }[];
};

const EMPTY_FILTERS: UniversityFilterState = {
  q: "",
  status: "",
};

type UniversitySortKey =
  | "name"
  | "location"
  | "students"
  | "semesters"
  | "summer"
  | "status";

const UNIVERSITY_SORT_ACCESSORS: Record<
  UniversitySortKey,
  (row: UniversityRow) => unknown
> = {
  name: (row) => row.name,
  location: (row) => [row.city, row.country].filter(Boolean).join(", "),
  students: (row) => row.studentCount,
  semesters: (row) => row.semesters.length,
  summer: (row) => row.hasSummerSemester,
  status: (row) => row.isActive,
};

export function UniversitiesList({ universities }: { universities: UniversityRow[] }) {
  const router = useRouter();
  const { startLoading } = useNavigationLoading();
  const [filters, setFilters] = useState<UniversityFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => filterUniversities(universities, filters),
    [universities, filters],
  );

  const { sortedItems, sortKey, sortDirection, onSort } = useTableSort<
    UniversityRow,
    UniversitySortKey
  >(
    filtered,
    UNIVERSITY_SORT_ACCESSORS,
    { key: "name", direction: "asc" },
  );

  const { items: paginatedUniversities, currentPage, totalPages } = useMemo(
    () => paginateItems(sortedItems, page),
    [sortedItems, page],
  );

  const exportRows = useMemo(
    () => universitiesToExportRows(paginatedUniversities),
    [paginatedUniversities],
  );

  const semesterExportRows = useMemo(
    () =>
      universitySemestersToExportRows(
        paginatedUniversities.flatMap((university) =>
          university.semesters.map((semester) => ({
            id: semester.id,
            universityId: university.id,
            universityName: university.name,
            academicYear: semester.academicYear,
            termCode: semester.termCode,
            label: semester.label,
            startDate: semester.startDate,
            endDate: semester.endDate,
            isActive: semester.isActive,
          })),
        ),
      ),
    [paginatedUniversities],
  );

  const exportExtraSheets = useMemo(
    () => [
      {
        name: "Semesters",
        columns: UNIVERSITY_SEMESTERS_TABLE_COLUMNS,
        rows: semesterExportRows,
        csvFilenameSuffix: "semesters",
      },
    ],
    [semesterExportRows],
  );

  const exportFilename = useMemo(() => {
    const stamp = new Date().toISOString().slice(0, 10);
    return `universities-page-${currentPage}-${stamp}`;
  }, [currentPage]);

  useEffect(() => {
    setPage(1);
  }, [filters.q, filters.status, sortKey, sortDirection]);

  function updateFilters(patch: Partial<UniversityFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function openUniversity(id: string) {
    startLoading();
    router.push(`/admin/universities/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Universities"
        description="Manage partner universities and their semester calendars."
        actions={
          <>
            <TableExportButton
              columns={UNIVERSITIES_TABLE_COLUMNS}
              rows={exportRows}
              filename={exportFilename}
              sheetName="Universities"
              extraSheets={exportExtraSheets}
            />
            <UniversityDialog />
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All universities</CardTitle>
          <CardDescription>
            {filtered.length} universit{filtered.length === 1 ? "y" : "ies"} on
            record.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <SearchField
              id="university-search"
              label="Search"
              value={filters.q}
              placeholder="Name or location"
              onChange={(q) => updateFilters({ q })}
            />

            <div className="space-y-1 lg:w-40">
              <label
                htmlFor="university-status"
                className="text-xs font-medium text-muted-foreground"
              >
                Status
              </label>
              <NativeSelect
                id="university-status"
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </NativeSelect>
            </div>
          </div>

          {paginatedUniversities.length === 0 ? (
            <EmptyState title="No universities match your filters" />
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
                        label="Location"
                        sortKey="location"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                      <SortableTableHead
                        label="Students"
                        sortKey="students"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                      <SortableTableHead
                        label="Semesters"
                        sortKey="semesters"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={onSort}
                      />
                      <SortableTableHead
                        label="Summer"
                        sortKey="summer"
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
                    {paginatedUniversities.map((university) => (
                      <TableRow
                        key={university.id}
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                        onClick={() => openUniversity(university.id)}
                      >
                        <TableCell className="font-medium">
                          {university.name}
                        </TableCell>
                        <TableCell>
                          {[university.city, university.country]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </TableCell>
                        <TableCell>{university.studentCount}</TableCell>
                        <TableCell>{university.semesters.length}</TableCell>
                        <TableCell>
                          {university.hasSummerSemester ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>
                          {university.isActive ? (
                            <Badge
                              variant="outline"
                              className="border-success/30 bg-success-light text-success"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
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
