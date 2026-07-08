"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

import { Plus } from "lucide-react";

import { SearchField } from "@/components/admin/search-field";
import { ClientPagination } from "@/components/client-pagination";
import { TableExportButton } from "@/components/export-button";
import { EmptyState } from "@/components/empty-state";
import { useNavigationLoading } from "@/components/layout/navigation-loading";
import { PageHeader } from "@/components/layout/page-header";
import { SortableTableHead } from "@/components/sortable-table-head";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DEGREE_PROGRAMS_TABLE_COLUMNS,
  UNIVERSITY_SEMESTERS_TABLE_COLUMNS,
} from "@/lib/export/table-columns";
import {
  degreeProgramsToExportRows,
  universitiesToExportRows,
  universitySemestersToExportRows,
} from "@/lib/export/table-rows";
import { useTableSort } from "@/hooks/use-table-sort";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";

export type UniversityRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  addressLine: string | null;
  websiteUrl: string | null;
  notes: string | null;
  imageUrl: string | null;
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

  const degreeProgramExportRows = useMemo(
    () =>
      degreeProgramsToExportRows(
        paginatedUniversities.flatMap((university) =>
          university.degreePrograms.map((program) => ({
            id: program.id,
            universityId: university.id,
            universityName: university.name,
            name: program.name,
            isActive: program.isActive,
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
      <div className="relative">
        <PageHeader
          title="Universities"
          description="Manage partner universities, semester calendars, and degree programs."
        />
        <div className="absolute top-0 right-0">
          <TableExportButton
            columns={UNIVERSITIES_TABLE_COLUMNS}
            rows={exportRows}
            filename={exportFilename}
            sheetName="Universities"
            extraSheets={exportExtraSheets}
            iconOnly
          />
        </div>
      </div>

      <UniversityDialog
        trigger={
          <button
            className="fixed bottom-16 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            title="New University"
          >
            <Plus className="size-6" />
          </button>
        }
      />

      <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {(["", "active", "inactive"] as const).map((val) => {
                const label = val === "" ? "All" : val === "active" ? "Active" : "Inactive";
                const active = filters.status === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateFilters({ status: val })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
              <span className="text-xs text-muted-foreground">
                {filtered.length} universit{filtered.length === 1 ? "y" : "ies"}
              </span>
            </div>
            <SearchField
              id="university-search"
              label="Search"
              value={filters.q}
              placeholder="Name or location"
              onChange={(q) => updateFilters({ q })}
            />
          </div>

          {paginatedUniversities.length === 0 ? (
            <EmptyState title="No universities match your filters" />
          ) : (
            <>
              {/* Mobile: carousel */}
              <div className="flex gap-3 overflow-x-auto pb-2 md:hidden snap-x snap-mandatory -mx-1 px-1">
                {paginatedUniversities.map((university, idx) => {
                  const imgSrc = university.imageUrl ? uploadPublicUrl(university.imageUrl) : null;
                  const location = [university.city, university.country].filter(Boolean).join(", ");
                  const CARD_COLORS = ["#6366f1","#0ea5e9","#f59e0b","#10b981","#ec4899","#8b5cf6","#ef4444","#14b8a6"];
                  const cardColor = CARD_COLORS[idx % CARD_COLORS.length];
                  const initial = university.name.charAt(0).toUpperCase();
                  return (
                    <button
                      key={university.id}
                      type="button"
                      onClick={() => openUniversity(university.id)}
                      className="snap-start shrink-0 w-[75vw] h-72 relative overflow-hidden rounded-tl-3xl cursor-pointer"
                      style={{ backgroundColor: imgSrc ? undefined : cardColor }}
                    >
                      {/* Background: full-bleed image, or colored bg with giant initial */}
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={university.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                          <span className="text-white/20 font-black" style={{ fontSize: "9rem", lineHeight: 1 }}>
                            {initial}
                          </span>
                        </div>
                      )}

                      {/* Status dot */}
                      <div className="absolute top-4 right-4">
                        <div className={cn("size-3 rounded-full shadow-[0_0_6px_2px_rgba(0,0,0,0.4)]", university.isActive ? "bg-emerald-400 shadow-emerald-400/70" : "bg-gray-200 shadow-gray-200/50")} />
                      </div>

                      {/* Bottom overlay */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-4 pt-12 pb-4">
                        <p className="text-white font-bold text-sm leading-tight line-clamp-2">{university.name}</p>
                        <p className="text-white/70 text-xs mt-1">
                          {[location, university.studentCount > 0 ? `${university.studentCount} students` : null].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Desktop: regular table */}
              <div className="hidden md:block overflow-x-auto">
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
      </div>
    </div>
  );
}
