"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { TermCode } from "@prisma/client";

import {
  deleteUniversitySemester,
  toggleUniversitySemesterActive,
} from "@/lib/actions/universities";
import { SortableTableHead } from "@/components/sortable-table-head";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableSort } from "@/hooks/use-table-sort";
import { formatDate } from "@/lib/format";

type SemesterRow = {
  id: string;
  label: string;
  academicYear: string;
  termCode: TermCode;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

type SortKey = "label" | "term" | "year" | "start" | "end" | "active";

const SORT_ACCESSORS: Record<SortKey, (row: SemesterRow) => unknown> = {
  label: (row) => row.label,
  term: (row) => row.termCode,
  year: (row) => row.academicYear,
  start: (row) => row.startDate,
  end: (row) => row.endDate,
  active: (row) => row.isActive,
};

export function SemesterTable({
  semesters,
  universityId,
}: {
  semesters: SemesterRow[];
  universityId: string;
}) {
  const [pending, startTransition] = useTransition();
  const { sortedItems, sortKey, sortDirection, onSort } = useTableSort<
    SemesterRow,
    SortKey
  >(
    semesters,
    SORT_ACCESSORS,
    { key: "start", direction: "desc" },
  );

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      try {
        await toggleUniversitySemesterActive(id, universityId, isActive);
        toast.success(isActive ? "Semester activated." : "Semester deactivated.");
      } catch {
        toast.error("Could not update semester.");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteUniversitySemester(id, universityId);
        toast.success("Semester deleted.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not delete semester.",
        );
      }
    });
  }

  if (semesters.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No semesters configured yet.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            label="Label"
            sortKey="label"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortableTableHead
            label="Term"
            sortKey="term"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortableTableHead
            label="Academic year"
            sortKey="year"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortableTableHead
            label="Start"
            sortKey="start"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortableTableHead
            label="End"
            sortKey="end"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortableTableHead
            label="Active"
            sortKey="active"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={onSort}
          />
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedItems.map((semester) => (
          <TableRow key={semester.id}>
            <TableCell className="font-medium">{semester.label}</TableCell>
            <TableCell>{semester.termCode}</TableCell>
            <TableCell>{semester.academicYear}</TableCell>
            <TableCell>{formatDate(semester.startDate)}</TableCell>
            <TableCell>{formatDate(semester.endDate)}</TableCell>
            <TableCell>
              <Switch
                checked={semester.isActive}
                disabled={pending}
                onCheckedChange={(checked) => handleToggle(semester.id, checked)}
              />
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => handleDelete(semester.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
