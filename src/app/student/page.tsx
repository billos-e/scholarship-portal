import Link from "next/link";
import {
  ArrowRight,
  FileText,
  History,
  User,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusStepper } from "@/components/status-stepper";
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
import { requireStudent } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboard() {
  const { student } = await requireStudent();

  const [latestRequest, recentRequests] = await Promise.all([
    prisma.tuitionPaymentRequest.findFirst({
      where: { studentId: student.id },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.tuitionPaymentRequest.findMany({
      where: { studentId: student.id },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${student.firstName}`}
        description={`${student.university?.name ?? "No university set"} · ${student.degreeProgram ?? "—"}`}
        actions={
          <Button render={<Link href="/student/submit" />}>
            New Submission
            <ArrowRight />
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Current Payment Request</CardTitle>
          <CardDescription>
            The status of your most recent semester submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {latestRequest ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {latestRequest.semesterLabel}
                  </p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(latestRequest.amountDue.toString())}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due {formatDate(latestRequest.dueDate)}
                  </p>
                </div>
                <StatusBadge status={latestRequest.status} />
              </div>
              <StatusStepper status={latestRequest.status} />
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link href={`/student/history/${latestRequest.id}`} />
                }
              >
                View details
              </Button>
            </>
          ) : (
            <EmptyState
              title="No submissions yet"
              description="Start your first semester submission to track tuition and academic progress."
              action={
                <Button render={<Link href="/student/submit" />}>
                  New Submission
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/student/profile" className="block">
          <StatCard
            label="My Profile"
            value="View"
            subtext="Contact & bank details"
            icon={User}
            className="h-full transition-colors hover:border-primary/30"
          />
        </Link>
        <Link href="/student/submit" className="block">
          <StatCard
            label="Semester Submission"
            value="Submit"
            subtext="Tuition & report"
            icon={FileText}
            className="h-full transition-colors hover:border-primary/30"
          />
        </Link>
        <Link href="/student/history" className="block">
          <StatCard
            label="Payment History"
            value={recentRequests.length}
            subtext="Past submissions"
            icon={History}
            className="h-full transition-colors hover:border-primary/30"
          />
        </Link>
      </div>

      {recentRequests.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Your latest payment requests.</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              render={<Link href="/student/history" />}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semester</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Link
                        href={`/student/history/${request.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {request.semesterLabel}
                      </Link>
                    </TableCell>
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
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
