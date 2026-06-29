import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  History,
  Plus,
  User,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PaymentRequestsTable } from "@/components/payment-requests-table";
import { QuickActionCard } from "@/components/quick-action-card";
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
import { requireStudent } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function StudentDashboard() {
  const { student } = await requireStudent();
  const hour = new Date().getHours();

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

  const semesterHint =
    latestRequest?.semesterLabel ??
    student.currentSemesterLabel ??
    "Current semester";

  return (
    <div className="space-y-8">
      <PageHeader
        size="lg"
        title={`${greetingForHour(hour)}, ${student.firstName}`}
        description={`${semesterHint} · ${student.university?.name ?? "No university set"}`}
        actions={
          <Button className="h-11 gap-2 px-5" render={<Link href="/student/submit" />}>
            <Plus className="size-4" />
            New Submission
          </Button>
        }
      />

      <Card className="border-border shadow-none">
        <CardContent className="flex flex-col gap-6 p-7 lg:flex-row lg:items-center lg:justify-between">
          {latestRequest ? (
            <>
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium text-muted-foreground">
                    Current Payment Request
                  </p>
                  <StatusBadge status={latestRequest.status} />
                </div>
                <div className="space-y-1">
                  <h2 className="font-heading text-xl font-bold">
                    {latestRequest.semesterLabel} Tuition Payment
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {formatDate(latestRequest.submittedAt)} · Amount:{" "}
                    {formatCurrency(latestRequest.amountDue.toString())}
                  </p>
                </div>
                <StatusStepper status={latestRequest.status} variant="dots" />
              </div>
              <Button
                variant="outline"
                className="h-10 shrink-0 px-4"
                render={
                  <Link href={`/student/history/${latestRequest.id}`} />
                }
              >
                View Details
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

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/student/profile" className="block">
          <QuickActionCard
            title="My Profile"
            description="Update contact & bank info"
            icon={User}
            tone="primary"
          />
        </Link>
        <Link href="/student/submit" className="block">
          <QuickActionCard
            title="Semester Submission"
            description="Tuition payment & academic report"
            icon={ClipboardList}
            tone="accent"
          />
        </Link>
        <Link href="/student/history" className="block">
          <QuickActionCard
            title="Payment History"
            description="View past submissions & status"
            icon={History}
            tone="info"
          />
        </Link>
      </div>

      {recentRequests.length > 0 ? (
        <Card className="border-border shadow-none">
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
              <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent>
            <PaymentRequestsTable
              rows={recentRequests.map((request) => ({
                id: request.id,
                semesterLabel: request.semesterLabel,
                amountDue: request.amountDue.toString(),
                submittedAt: request.submittedAt.toISOString(),
                status: request.status,
                href: `/student/history/${request.id}`,
              }))}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
