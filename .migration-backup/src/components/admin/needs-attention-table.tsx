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

  return (
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
              onClick={() => {
                startLoading();
                router.push(`/admin/requests/${request.id}`);
              }}
            >
              <TableCell className="font-medium">{request.studentName}</TableCell>
              <TableCell>{request.universityName}</TableCell>
              <TableCell>{request.semesterName}</TableCell>
              <TableCell
                className={cn(overdue && "font-medium text-destructive")}
              >
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
  );
}
