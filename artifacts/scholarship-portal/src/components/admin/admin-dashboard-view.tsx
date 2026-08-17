"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle, ClipboardList, Users, Wallet } from "lucide-react";
import type { RequestStatus, StudentStatus } from "@prisma/client";

import { NeedsAttentionTable } from "@/components/admin/needs-attention-table";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sortRequestsByUrgency, OPEN_REQUEST_STATUSES } from "@/lib/request-urgency";
import type { RequestCategory } from "@/lib/request-category";

type DashboardStudent = {
  universityId: string | null;
  status: StudentStatus;
};

type DashboardRequest = {
  id: string;
  semesterLabel: string;
  universitySemesterId: string | null;
  semesterAcademicYear: string | null;
  studentUniversityId: string | null;
  dueDate: string | null;
  submittedAt: string;
  status: RequestStatus;
  requestCategory: RequestCategory;
  studentName: string;
  universityName: string;
  semesterName: string;
};

type AdminDashboardViewProps = {
  years: string[];
  universities: { id: string; name: string }[];
  semesters: { id: string; label: string }[];
  students: DashboardStudent[];
  requests: DashboardRequest[];
};

export function AdminDashboardView({
  students,
  requests,
}: AdminDashboardViewProps) {
  const activeStudents = students.filter((s) => s.status === "ACTIVE").length;

  const pendingReview = requests.filter((r) =>
    OPEN_REQUEST_STATUSES.includes(r.status),
  ).length;

  const approvedUnpaid = requests.filter((r) => r.status === "APPROVED").length;

  const paidCount = requests.filter((r) => r.status === "PAID").length;

  const needsAttention = sortRequestsByUrgency(
    requests
      .filter((r) => OPEN_REQUEST_STATUSES.includes(r.status))
      .map((r) => ({
        id: r.id,
        semesterLabel: r.semesterLabel,
        semesterName: r.semesterName,
        requestCategory: r.requestCategory,
        dueDate: r.dueDate ? new Date(r.dueDate) : null,
        submittedAt: new Date(r.submittedAt),
        status: r.status,
        studentName: r.studentName,
        universityName: r.universityName,
      })),
  ).slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        size="lg"
        title="Dashboard"
        description="Overview of students and payment requests."
      />

      <div className="space-y-6">
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
            icon={ClipboardList}
            tone="warning"
          />
          <StatCard
            label="Approved (Unpaid)"
            value={approvedUnpaid}
            icon={CheckCircle}
            tone="accent"
          />
          <StatCard
            label="Paid"
            value={paidCount}
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
                Submitted or under review — sorted by due date and status.
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
                description="No requests need attention."
              />
            ) : (
              <div className="overflow-x-auto">
                <NeedsAttentionTable rows={needsAttention} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
