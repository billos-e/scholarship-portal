import Link from "next/link";
import { AlertCircle, CheckCircle, ClipboardList, Users, Wallet } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type SearchParams = { semester?: string };

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const selectedSemester = params.semester?.trim() ?? "";

  const [semesterOptions, latestSemester] = await Promise.all([
    prisma.universitySemester.findMany({
      where: { isActive: true },
      orderBy: { startDate: "desc" },
      select: { label: true },
      distinct: ["label"],
    }),
    prisma.tuitionPaymentRequest.findFirst({
      orderBy: { submittedAt: "desc" },
      select: { semesterLabel: true },
    }),
  ]);

  const labels = semesterOptions.map((s) => s.label);
  const currentSemester =
    selectedSemester ||
    labels[0] ||
    latestSemester?.semesterLabel ||
    null;

  const semesterFilter = currentSemester
    ? { semesterLabel: currentSemester }
    : {};

  const [
    activeStudents,
    pendingReview,
    approvedUnpaid,
    paidThisSemester,
    needsAttention,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.tuitionPaymentRequest.count({
      where: {
        ...semesterFilter,
        status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      },
    }),
    prisma.tuitionPaymentRequest.count({
      where: { ...semesterFilter, status: "APPROVED" },
    }),
    prisma.tuitionPaymentRequest.count({
      where: { ...semesterFilter, status: "PAID" },
    }),
    prisma.tuitionPaymentRequest.findMany({
      where: {
        ...semesterFilter,
        status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] },
      },
      orderBy: { submittedAt: "asc" },
      take: 10,
      include: { student: { include: { university: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of students and payment requests."
        actions={
          <form className="flex items-center gap-2">
            <NativeSelect name="semester" defaultValue={currentSemester ?? ""}>
              <option value="">All semesters</option>
              {labels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </NativeSelect>
            <Button type="submit" size="sm" variant="outline">
              Apply
            </Button>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Students"
          value={activeStudents}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Pending Review"
          value={pendingReview}
          subtext={currentSemester ?? "All semesters"}
          icon={ClipboardList}
          tone="warning"
        />
        <StatCard
          label="Approved (Unpaid)"
          value={approvedUnpaid}
          subtext={currentSemester ?? "All semesters"}
          icon={CheckCircle}
          tone="info"
        />
        <StatCard
          label="Paid this semester"
          value={paidThisSemester}
          subtext={currentSemester ?? "All semesters"}
          icon={Wallet}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" />
              Needs Attention
            </CardTitle>
            <CardDescription>
              Submitted, under review, or approved — waiting for the next step.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/admin/requests" />}
          >
            All requests
          </Button>
        </CardHeader>
        <CardContent>
          {needsAttention.length === 0 ? (
            <EmptyState
              title="Inbox is clear"
              description="No requests need attention for the selected semester."
            />
          ) : (
            <div className="overflow-x-auto">
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
                  {needsAttention.map((request) => (
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
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
