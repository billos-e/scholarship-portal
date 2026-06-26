import Link from "next/link";
import type { Prisma, RequestStatus } from "@prisma/client";
import { Search } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  q?: string;
  semester?: string;
  status?: string;
  uni?: string;
};

const STATUS_VALUES: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "PAID",
];

const STATUS_LABEL: Record<RequestStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  PAID: "Paid",
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const semester = params.semester?.trim() ?? "";
  const status = params.status ?? "";
  const uni = params.uni ?? "";

  const where: Prisma.TuitionPaymentRequestWhereInput = {};
  if (semester) where.semesterLabel = semester;
  if (status && STATUS_VALUES.includes(status as RequestStatus)) {
    where.status = status as RequestStatus;
  }

  const studentWhere: Prisma.StudentWhereInput = {};
  if (uni) studentWhere.universityId = uni;
  if (q) {
    studentWhere.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { studentId: { contains: q, mode: "insensitive" } },
    ];
  }
  if (uni || q) {
    where.student = { is: studentWhere };
  }

  const [requests, universities, semesters] = await Promise.all([
    prisma.tuitionPaymentRequest.findMany({
      where,
      orderBy: [{ submittedAt: "desc" }],
      include: {
        student: { include: { university: true } },
      },
    }),
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.tuitionPaymentRequest.findMany({
      distinct: ["semesterLabel"],
      orderBy: { semesterLabel: "desc" },
      select: { semesterLabel: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Payment Requests
        </h1>
        <p className="text-muted-foreground">
          Review submissions, update statuses, and record payments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All requests</CardTitle>
          <CardDescription>
            {requests.length} request{requests.length === 1 ? "" : "s"} matching
            your filters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                Search student
              </label>
              <Input
                name="q"
                defaultValue={q}
                placeholder="Name or student ID"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Semester
              </label>
              <NativeSelect name="semester" defaultValue={semester}>
                <option value="">All semesters</option>
                {semesters.map((s) => (
                  <option key={s.semesterLabel} value={s.semesterLabel}>
                    {s.semesterLabel}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <NativeSelect name="status" defaultValue={status}>
                <option value="">All statuses</option>
                {STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                University
              </label>
              <NativeSelect name="uni" defaultValue={uni}>
                <option value="">All universities</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="lg:col-span-5">
              <Button type="submit" variant="outline">
                <Search /> Filter
              </Button>
            </div>
          </form>

          {requests.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No requests match your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/requests/${request.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {request.student.firstName} {request.student.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {request.student.university?.name ?? "—"}
                    </TableCell>
                    <TableCell>{request.semesterLabel}</TableCell>
                    <TableCell>
                      {formatCurrency(request.amountDue.toString())}
                    </TableCell>
                    <TableCell>{formatDate(request.submittedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        render={
                          <Link href={`/admin/requests/${request.id}`} />
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
