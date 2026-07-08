"use client";

import { useRouter } from "next/navigation";
import type { RequestStatus } from "@prisma/client";

import { useNavigationLoading } from "@/components/layout/navigation-loading";
import { SortableTableHead } from "@/components/sortable-table-head";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableSort } from "@/hooks/use-table-sort";
import { formatDate } from "@/lib/format";
import { isRequestOverdue } from "@/lib/request-urgency";
import { cn } from "@/lib/utils";

export type NeedsAttentionRow = {
  id: string;
  semesterLabel: string;
  semesterName: string;
  dueDate: Date | null;
  submittedAt: Date;
  status: RequestStatus;
  studentName: string;
  universityName: string;
};

type NeedsAttentionTableProps = {
  rows: NeedsAttentionRow[];
};

type SortKey =
  | "student"
  | "university"
  | "semester"
  | "due"
  | "submitted"
  | "status";

const SORT_ACCESSORS: Record<SortKey, (row: NeedsAttentionRow) => unknown> = {
  student: (row) => row.studentName,
  university: (row) => row.universityName,
  semester: (row) => row.semesterName,
  due: (row) => row.dueDate,
  submitted: (row) => row.submittedAt,
  status: (row) => row.status,
};

export function NeedsAttentionTable({ rows }: NeedsAttentionTableProps) {
  const router = useRouter();
  const { startLoading } = useNavigationLoading();
  const { sortedItems, sortKey, sortDirection, onSort } = useTableSort<
    NeedsAttentionRow,
    SortKey
  >(rows, SORT_ACCESSORS);

  function openRequest(id: string) {
    startLoading();
    router.push(`/admin/requests/${id}`);
  }

  return (
    <>
      {/* Mobile: horizontal card strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 md:hidden snap-x snap-mandatory -mx-1 px-1">
        {sortedItems.map((request) => {
          const overdue = isRequestOverdue(request.dueDate);
          return (
            <button
              key={request.id}
              type="button"
              onClick={() => openRequest(request.id)}
              className="snap-start shrink-0 w-56 rounded-xl border border-border/70 bg-card p-4 text-left shadow-sm cursor-pointer transition-colors hover:bg-muted/30"
            >
              <p className="font-semibold text-sm text-foreground truncate">
                {request.studentName}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {request.universityName}
              </p>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 font-medium">Semester</span>
                  <span className="truncate text-right">{request.semesterName}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 font-medium">Due</span>
                  <span className={cn("truncate text-right", overdue && "font-semibold text-destructive")}>
                    {request.dueDate ? formatDate(request.dueDate) : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 font-medium">Submitted</span>
                  <span className="truncate text-right">{formatDate(request.submittedAt)}</span>
                </div>
              </div>
              <div className="mt-3">
                <StatusBadge status={request.status} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop: regular table */}
      <div className="hidden md:block">
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
                label="Due"
                sortKey="due"
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
            {sortedItems.map((request) => {
              const overdue = isRequestOverdue(request.dueDate);
              return (
                <TableRow
                  key={request.id}
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => openRequest(request.id)}
                >
                  <TableCell className="font-medium">{request.studentName}</TableCell>
                  <TableCell>{request.universityName}</TableCell>
                  <TableCell>{request.semesterName}</TableCell>
                  <TableCell className={cn(overdue && "font-medium text-destructive")}>
                    {request.dueDate ? formatDate(request.dueDate) : "—"}
                  </TableCell>
                  <TableCell>{formatDate(request.submittedAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
