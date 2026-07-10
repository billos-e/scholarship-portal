"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  History,
  Plus,
  User,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { LatestSubmissionCard } from "@/components/student/latest-submission-card";
import { PaymentRequestsTable } from "@/components/payment-requests-table";
import { QuickActionCard } from "@/components/quick-action-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { fetchStudent, type StudentDetail } from "@/lib/api/students";
import {
  getMissingProfileFields,
  PROFILE_FIELD_LABELS,
  BLOCKING_REQUEST_STATUSES,
  type StudentForEligibility,
  type ProfileField,
} from "@/lib/submissions/eligibility";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function StudentDashboard() {
  const user = getCurrentUser();
  const studentProfileId = user?.studentProfileId ?? null;

  const [student, setStudent] = useState<StudentDetail | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!studentProfileId) {
      setStudent(null);
      return;
    }
    fetchStudent(studentProfileId)
      .then(setStudent)
      .catch(() => setStudent(null));
  }, [studentProfileId]);

  if (!studentProfileId) {
    return (
      <EmptyState
        title="Profile not set up yet"
        description="Your student profile hasn't been linked to your account. Please contact your administrator."
      />
    );
  }

  if (student === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!student) {
    return (
      <EmptyState
        title="Profile unavailable"
        description="We couldn't load your profile. Please try again later."
      />
    );
  }

  const hour = new Date().getHours();
  const missingProfileFields = getMissingProfileFields(
    student as unknown as StudentForEligibility,
  );
  const openRequest =
    student.tuitionPaymentRequests.find((r) =>
      BLOCKING_REQUEST_STATUSES.includes(r.status),
    ) ?? null;
  const eligibility = {
    canStart: missingProfileFields.length === 0 && openRequest === null,
    missingProfileFields: missingProfileFields as ProfileField[],
    openRequest: openRequest
      ? { id: openRequest.id, semesterLabel: openRequest.semesterLabel }
      : null,
  };

  const requests = student.tuitionPaymentRequests;
  const latestRequest = requests[0] ?? null;
  const recentRequests = requests.slice(0, 5);

  const semesterHint =
    eligibility.openRequest?.semesterLabel ??
    student.currentSemesterLabel ??
    latestRequest?.semesterLabel ??
    "Current semester";

  return (
    <div className="space-y-6 sm:space-y-8">
      {eligibility.missingProfileFields.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div className="min-w-0">
              <p className="font-medium text-warning-foreground">Profile incomplete</p>
              <p className="mt-0.5 text-muted-foreground">
                Missing:{" "}
                {eligibility.missingProfileFields
                  .map((f) => PROFILE_FIELD_LABELS[f])
                  .join(", ")}
                .{" "}
                <Link
                  href="/student/profile/edit"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Complete your profile
                </Link>{" "}
                to enable semester submissions.
              </p>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        size="lg"
        title={`${greetingForHour(hour)}, ${student.firstName}`}
        description={`${semesterHint} · ${student.university?.name ?? "No university set"}`}
        actions={
          eligibility.canStart ? (
            <Button className="h-11 gap-2 px-5" render={<Link href="/student/submit" />}>
              <Plus className="size-4" />
              New Submission
            </Button>
          ) : eligibility.missingProfileFields.length > 0 ? (
            <Button
              className="h-11 gap-2 px-5"
              render={<Link href="/student/profile/edit" />}
            >
              <User className="size-4" />
              Complete profile
            </Button>
          ) : null
        }
      />

      {latestRequest ? (
        <LatestSubmissionCard
          request={{
            id: latestRequest.id,
            semesterLabel: latestRequest.semesterLabel,
            amountDue: latestRequest.amountDue.toString(),
            submittedAt: latestRequest.submittedAt,
            dueDate: latestRequest.dueDate,
            status: latestRequest.status,
          }}
        />
      ) : (
        <EmptyState
          title="No submissions yet"
          description={
            eligibility.canStart
              ? "Start your first semester submission to track tuition and academic progress."
              : eligibility.missingProfileFields.length > 0
                ? "Complete your profile before starting your first submission."
                : "Finish or resolve your current request before starting another."
          }
          action={
            eligibility.canStart ? (
              <Button render={<Link href="/student/submit" />}>
                New Submission
              </Button>
            ) : eligibility.missingProfileFields.length > 0 ? (
              <Button render={<Link href="/student/profile/edit" />}>
                Complete profile
              </Button>
            ) : null
          }
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <Link href="/student/profile" className="block">
          <QuickActionCard
            title="My Profile"
            description="Update contact & bank info"
            icon={User}
            tone="primary"
          />
        </Link>
        <Link
          href={
            eligibility.canStart
              ? "/student/submit"
              : eligibility.openRequest
                ? `/student/history/${eligibility.openRequest.id}`
                : "/student/profile/edit"
          }
          className="block"
        >
          <QuickActionCard
            title="Semester Submission"
            description={
              eligibility.canStart
                ? "Tuition payment & academic report"
                : eligibility.missingProfileFields.length > 0
                  ? "Complete your profile first"
                  : "Active request in progress"
            }
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
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Your latest payment requests.</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full shrink-0 sm:w-auto"
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
