import Link from "next/link";
import { ArrowRight, FilePlus2, History } from "lucide-react";

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

export default async function StudentDashboard() {
  const { student } = await requireStudent();

  const latestRequest = await prisma.tuitionPaymentRequest.findFirst({
    where: { studentId: student.id },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {student.firstName}
        </h1>
        <p className="text-muted-foreground">
          {student.university?.name ?? "No university set"} ·{" "}
          {student.degreeProgram ?? "—"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest payment request</CardTitle>
          <CardDescription>
            The status of your most recent semester submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestRequest ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No submissions yet. Start your first semester submission below.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FilePlus2 className="size-4 text-primary" />
              New semester submission
            </CardTitle>
            <CardDescription>
              Submit your tuition payment request and semester report.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" render={<Link href="/student/submit" />}>
              Start submission <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="size-4 text-primary" />
              Submission history
            </CardTitle>
            <CardDescription>
              Review your past semesters and their payment statuses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              render={<Link href="/student/history" />}
            >
              View history <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
