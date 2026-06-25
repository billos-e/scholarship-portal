import Link from "next/link";
import { ClipboardList, GraduationCap, Users, Wallet } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
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

  const [activeStudents, pendingRequests, paidCount, recentRequests] =
    await Promise.all([
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.tuitionPaymentRequest.count({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      }),
      prisma.tuitionPaymentRequest.count({ where: { status: "PAID" } }),
      prisma.tuitionPaymentRequest.findMany({
        orderBy: { submittedAt: "desc" },
        take: 8,
        include: { student: true },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of students and payment requests.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Active students" value={activeStudents} icon={Users} />
        <KpiCard
          label="Pending requests"
          value={pendingRequests}
          icon={ClipboardList}
        />
        <KpiCard label="Paid requests" value={paidCount} icon={Wallet} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            Recent payment requests
          </CardTitle>
          <CardDescription>
            The latest semester submissions across all students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No payment requests yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.student.firstName} {request.student.lastName}
                    </TableCell>
                    <TableCell>{request.semesterLabel}</TableCell>
                    <TableCell>
                      {formatCurrency(request.amountDue.toString())}
                    </TableCell>
                    <TableCell>{formatDate(request.submittedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="mt-4">
            <Link
              href="/admin/requests"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all requests →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
