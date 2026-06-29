"use client";

import Link from "next/link";
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
  const { sortedItems, sortKey, sortDirection, onSort } = useTableSort<
    PaymentRequestRow,
    SortKey
  >(rows, SORT_ACCESSORS);

  return (
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
          <TableRow key={request.id}>
            <TableCell>
              <Link
                href={request.href}
                className="font-medium hover:text-primary hover:underline"
              >
                {request.semesterLabel}
              </Link>
            </TableCell>
            <TableCell>{formatCurrency(request.amountDue)}</TableCell>
            <TableCell>{formatDate(new Date(request.submittedAt))}</TableCell>
            <TableCell>
              <StatusBadge status={request.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
