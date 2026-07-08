"use client";

import { useLocation } from "wouter";
import type { RequestStatus } from "@prisma/client";

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
import { formatCurrency, formatDate } from "@/lib/format";

type PaymentRequestRow = {
  id: string;
  semesterLabel: string;
  amountDue: string;
  submittedAt: string;
  status: RequestStatus;
  href: string;
};

type PaymentRequestsTableProps = {
  rows: PaymentRequestRow[];
};

type SortKey = "semester" | "amount" | "submitted" | "status";

const SORT_ACCESSORS: Record<SortKey, (row: PaymentRequestRow) => unknown> = {
  semester: (row) => row.semesterLabel,
  amount: (row) => Number(row.amountDue),
  submitted: (row) => new Date(row.submittedAt),
  status: (row) => row.status,
};

export function PaymentRequestsTable({ rows }: PaymentRequestsTableProps) {
  const [, navigate] = useLocation();
  const { sortedItems, sortKey, sortDirection, onSort } = useTableSort<
    PaymentRequestRow,
    SortKey
  >(rows, SORT_ACCESSORS);

  return (
    <>
      <div className="space-y-2 md:hidden">
        {sortedItems.map((request) => (
          <div
            key={request.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(request.href)}
            onKeyDown={(e) => e.key === "Enter" && navigate(request.href)}
            className="block cursor-pointer rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-colors hover:border-primary/25 hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {request.semesterLabel}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatCurrency(request.amountDue)}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Submitted {formatDate(new Date(request.submittedAt))}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="Semester"
                sortKey="semester"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={onSort}
              />
              <SortableTableHead
                label="Amount"
                sortKey="amount"
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
            {sortedItems.map((request) => (
              <TableRow
                key={request.id}
                className="cursor-pointer"
                onClick={() => navigate(request.href)}
              >
                <TableCell className="font-medium">{request.semesterLabel}</TableCell>
                <TableCell>{formatCurrency(request.amountDue)}</TableCell>
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
    </>
  );
}
