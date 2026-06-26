import Link from "next/link";
import {
  AlertCircle,
  ClipboardList,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboard() {
  await requireAdmin();

  // Find the most recent semester label so we can compute "this semester" KPIs.
  const latestSemester = await prisma.tuitionPaymentRequest.findFirst({
    orderBy: { submittedAt: "desc" },
    select: { semesterLabel: true },
  });
  const currentSemester = latestSemester?.semesterLabel ?? null;

  const [
    activeStudents,
    pendingRequests,
    paidCount,
    paidThisSemester,
    paidThisSemesterSum,
    needsAttention,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.tuitionPaymentRequest.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    }),
    prisma.tuitionPaymentRequest.count({ where: { status: "PAID" } }),
    currentSemester
      ? prisma.tuitionPaymentRequest.count({
          where: { semesterLabel: currentSemester, status: "PAID" },
        })
      : Promise.resolve(0),
    currentSemester
      ? prisma.tuitionPaymentRequest.aggregate({
          where: { semesterLabel: currentSemester, status: "PAID" },
          _sum: { amountDue: true },
        })
      : Promise.resolve({ _sum: { amountDue: null } }),
    prisma.tuitionPaymentRequest.findMany({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] } },
      orderBy: { submittedAt: "asc" },
      take: 10,
      include: { student: { include: { university: true } } },
    }),
  ]);

  const paidThisSemesterAmount =
    paidThisSemesterSum._sum.amountDue?.toString() ?? "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of students and payment requests
          {currentSemester ? ` · current semester: ${currentSemester}` : ""}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active students" value={activeStudents} icon={Users} />
        <KpiCard
          label="Pending requests"
          value={pendingRequests}
          icon={ClipboardList}
        />
        <KpiCard
          label={
            currentSemester
              ? `Paid · ${currentSemester}`
              : "Paid this semester"
          }
          value={paidThisSemester}
          icon={Wallet}
        />
        <KpiCard
          label={
            currentSemester
              ? `Paid amount · ${currentSemester}`
              : "Paid amount this semester"
          }
          value={formatCurrency(paidThisSemesterAmount)}
          icon={Wallet}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" />
              Needs attention
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
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Inbox is clear. Total paid to date: {paidCount}.
            </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            Lifetime
          </CardTitle>
          <CardDescription>
            All-time totals across every semester.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard
              label="Paid requests (all time)"
              value={paidCount}
              icon={Wallet}
            />
            <KpiCard
              label="Pending requests"
              value={pendingRequests}
              icon={ClipboardList}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
