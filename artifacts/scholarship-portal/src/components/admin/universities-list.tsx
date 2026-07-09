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
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UniversityDialog } from "@/app/admin/universities/university-dialog";
import { PAGE_SIZE } from "@/lib/pagination";
import {
  UNIVERSITIES_TABLE_COLUMNS,
  DEGREE_PROGRAMS_TABLE_COLUMNS,
  UNIVERSITY_SEMESTERS_TABLE_COLUMNS,
} from "@/lib/export/table-columns";
import {
  degreeProgramsToExportRows,
  universitiesToExportRows,
  universitySemestersToExportRows,
} from "@/lib/export/table-rows";
import type { SortDirection } from "@/lib/table-sort";
import { fetchUniversities, type UniversityListItem } from "@/lib/api/universities";

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
  degreePrograms: {
    id: string;
    name: string;
    isActive: boolean;
  }[];
};

type UniversityFilterState = {
  q: string;
  status: string;
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

const SERVER_SORT_KEYS: Partial<Record<UniversitySortKey, string>> = {
  name: "name",
  summer: "summer",
  status: "status",
};

function toRow(university: UniversityListItem): UniversityRow {
  return {
    id: university.id,
    name: university.name,
    city: university.city,
    country: university.country,
    addressLine: university.addressLine,
    websiteUrl: university.websiteUrl,
    notes: university.notes,
    studentCount: university._count.students,
    hasSummerSemester: university.hasSummerSemester,
    isActive: university.isActive,
    semesters: university.semesters.map((semester) => ({
      id: semester.id,
      academicYear: semester.academicYear,
      termCode: semester.termCode,
      label: semester.label,
      startDate: semester.startDate,
      endDate: semester.endDate,
      isActive: semester.isActive,
    })),
    degreePrograms: university.degreePrograms.map((program) => ({
      id: program.id,
      name: program.name,
      isActive: program.isActive,
    })),
  };
}

export function UniversitiesList() {
  const router = useRouter();
  const { startLoading } = useNavigationLoading();
  const [filters, setFilters] = useState<UniversityFilterState>(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<UniversitySortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [universities, setUniversities] = useState<UniversityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((current) => ({ ...current, q: searchInput }));
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [filters.q, filters.status]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const serverSortKey = SERVER_SORT_KEYS[sortKey];
    fetchUniversities({
      page,
      limit: PAGE_SIZE,
      search: filters.q || undefined,
      status: filters.status || undefined,
      sortKey: serverSortKey,
      sortDir: sortDirection,
    })
      .then((result) => {
        if (cancelled) return;
        let items = result.items.map(toRow);
        if (!serverSortKey) {
          const multiplier = sortDirection === "asc" ? 1 : -1;
          items = [...items].sort((a, b) => {
            const av = sortKey === "location"
              ? [a.city, a.country].filter(Boolean).join(", ")
              : a.semesters.length;
            const bv = sortKey === "location"
              ? [b.city, b.country].filter(Boolean).join(", ")
              : b.semesters.length;
            if (sortKey === "students") {
              return (a.studentCount - b.studentCount) * multiplier;
            }
            if (typeof av === "number" && typeof bv === "number") {
              return (av - bv) * multiplier;
            }
            return String(av).localeCompare(String(bv)) * multiplier;
          });
        }
        setUniversities(items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch(() => {
        if (!cancelled) {
          setUniversities([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, filters, sortKey, sortDirection]);

  const exportRows = useMemo(() => universitiesToExportRows(universities), [universities]);

  const semesterExportRows = useMemo(
    () =>
      universitySemestersToExportRows(
        universities.flatMap((university) =>
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
    [universities],
  );

  const degreeProgramExportRows = useMemo(
    () =>
      degreeProgramsToExportRows(
        universities.flatMap((university) =>
          university.degreePrograms.map((program) => ({
            id: program.id,
            universityId: university.id,
            universityName: university.name,
            name: program.name,
            isActive: program.isActive,
          })),
        ),
      ),
    [universities],
  );

  const exportExtraSheets = useMemo(
    () => [
      {
        name: "Semesters",
        columns: UNIVERSITY_SEMESTERS_TABLE_COLUMNS,
        rows: semesterExportRows,
        csvFilenameSuffix: "semesters",
      },
      {
        name: "Degree programs",
        columns: DEGREE_PROGRAMS_TABLE_COLUMNS,
        rows: degreeProgramExportRows,
        csvFilenameSuffix: "degree-programs",
      },
    ],
    [semesterExportRows, degreeProgramExportRows],
  );

  const exportFilename = useMemo(() => {
    const stamp = new Date().toISOString().slice(0, 10);
    return `universities-page-${page}-${stamp}`;
  }, [page]);

  function updateFilters(patch: Partial<UniversityFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function handleSort(key: UniversitySortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortKey("name");
      setSortDirection("asc");
    }
  }

  function openUniversity(id: string) {
    startLoading();
    router.push(`/admin/universities/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Universities (${total})`}
        description="Manage partner universities, semester calendars, and degree programs."
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
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <SearchField
              id="university-search"
              label="Search"
              value={searchInput}
              placeholder="Name or location"
              onChange={setSearchInput}
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

          {!loading && universities.length === 0 ? (
            <EmptyState title="No universities match your filters" />
          ) : (
            <>
              <div className={"overflow-x-auto" + (loading ? " opacity-60" : "")}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="Name"
                        sortKey="name"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        label="Location"
                        sortKey="location"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        label="Students"
                        sortKey="students"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        label="Semesters"
                        sortKey="semesters"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        label="Summer"
                        sortKey="summer"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        label="Status"
                        sortKey="status"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {universities.map((university) => (
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
                currentPage={page}
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
