"use client";

import { useRouter } from "next/navigation";
import type { StudentStatus } from "@prisma/client";

import { useNavigationLoading } from "@/components/layout/navigation-loading";
import { SortableTableHead } from "@/components/sortable-table-head";
import { StudentStatusBadge } from "@/components/student-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableSort } from "@/hooks/use-table-sort";

type UniversityStudentRow = {
  id: string;
  name: string;
  studentId: string | null;
  status: StudentStatus;
};

type UniversityStudentsTableProps = {
  rows: UniversityStudentRow[];
};

type SortKey = "name" | "studentId" | "status";

const SORT_ACCESSORS: Record<SortKey, (row: UniversityStudentRow) => unknown> = {
  name: (row) => row.name,
  studentId: (row) => row.studentId,
  status: (row) => row.status,
};

export function UniversityStudentsTable({ rows }: UniversityStudentsTableProps) {
  const router = useRouter();
  const { startLoading } = useNavigationLoading();
  const { sortedItems, sortKey, sortDirection, onSort } = useTableSort<
    UniversityStudentRow,
    SortKey
  >(
    rows,
    SORT_ACCESSORS,
    { key: "name", direction: "asc" },
  );

  function openStudent(id: string) {
    startLoading();
    router.push(`/admin/students/${id}`);
  }

  return (
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
            label="Student ID"
            sortKey="studentId"
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
        {sortedItems.map((student) => (
          <TableRow
            key={student.id}
            className="cursor-pointer transition-colors hover:bg-muted/40"
            onClick={() => openStudent(student.id)}
          >
            <TableCell className="font-medium">{student.name}</TableCell>
            <TableCell>{student.studentId ?? "—"}</TableCell>
            <TableCell>
              <StudentStatusBadge status={student.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
