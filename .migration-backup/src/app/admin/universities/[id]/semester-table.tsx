"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableSort } from "@/hooks/use-table-sort";
import { formatDate } from "@/lib/format";
import {
  SemesterEditDialog,
  type SemesterEditValues,
} from "./semester-edit-dialog";

type SemesterRow = {
  id: string;
  label: string;
  academicYear: string;
  termCode: TermCode;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  canDelete: boolean;
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterEditValues | null>(
    null,
  );
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

  function openCreate() {
    setEditingSemester(null);
    setDialogOpen(true);
  }

  function openEdit(semester: SemesterRow) {
    setEditingSemester({
      id: semester.id,
      label: semester.label,
      academicYear: semester.academicYear,
      termCode: semester.termCode,
      startDate: semester.startDate,
      endDate: semester.endDate,
      isActive: semester.isActive,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingSemester(null);
  }

  return (
    <>
      {semesters.length === 0 ? (
        <p className="text-sm text-muted-foreground">No semesters configured yet.</p>
      ) : (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((semester) => (
              <TableRow
                key={semester.id}
                className="group cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => openEdit(semester)}
              >
                <TableCell className="font-medium">{semester.label}</TableCell>
                <TableCell>{semester.termCode}</TableCell>
                <TableCell>{semester.academicYear}</TableCell>
                <TableCell>{formatDate(semester.startDate)}</TableCell>
                <TableCell>{formatDate(semester.endDate)}</TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-between gap-2">
                    <Switch
                      checked={semester.isActive}
                      disabled={pending}
                      onCheckedChange={(checked) =>
                        handleToggle(semester.id, checked)
                      }
                    />
                    {semester.canDelete ? (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={pending}
                        aria-label={`Delete ${semester.label}`}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        onClick={() => handleDelete(semester.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex justify-end border-t border-border/50 pt-4">
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Add semester
        </Button>
      </div>

      <SemesterEditDialog
        universityId={universityId}
        semester={editingSemester}
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}
      />
    </>
  );
}
