"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, ClipboardList, Users, Wallet } from "lucide-react";
import type { RequestStatus, StudentStatus } from "@prisma/client";

import {
  DashboardFilters,
  type SemesterOption,
  type UniversityOption,
} from "@/components/admin/dashboard-filters";
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
import {
  matchesActiveStudent,
  matchesDashboardSubmission,
  type DashboardFilterState,
} from "@/lib/client-filters";
import { sortRequestsByUrgency } from "@/lib/request-urgency";

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
  studentName: string;
  universityName: string;
  semesterName: string;
};

type AdminDashboardViewProps = {
  years: string[];
  universities: UniversityOption[];
  semesters: SemesterOption[];
  students: DashboardStudent[];
  requests: DashboardRequest[];
};

const EMPTY_FILTERS: DashboardFilterState = {
  year: "",
  university: "",
  semester: "",
};

export function AdminDashboardView({
  years,
  universities,
  semesters,
  students,
  requests,
}: AdminDashboardViewProps) {
  const [filters, setFilters] = useState<DashboardFilterState>(EMPTY_FILTERS);

  const filteredRequests = useMemo(
    () => requests.filter((request) => matchesDashboardSubmission(request, filters)),
    [requests, filters],
  );

  const activeStudents = useMemo(
    () => students.filter((student) => matchesActiveStudent(student, filters)).length,
    [students, filters],
  );

  const pendingReview = useMemo(
    () =>
      filteredRequests.filter((request) =>
        ["SUBMITTED"].includes(request.status),
      ).length,
    [filteredRequests],
  );

  const approvedUnpaid = useMemo(
    () => filteredRequests.filter((request) => request.status === "APPROVED").length,
    [filteredRequests],
  );

  const paidCount = useMemo(
    () => filteredRequests.filter((request) => request.status === "PAID").length,
    [filteredRequests],
  );

  const needsAttention = useMemo(() => {
    return sortRequestsByUrgency(
      filteredRequests
        .filter((request) => request.status === "SUBMITTED")
        .map((request) => ({
          ...request,
          dueDate: request.dueDate ? new Date(request.dueDate) : null,
          submittedAt: new Date(request.submittedAt),
        })),
    )
      .slice(0, 10)
      .map((request) => ({
        id: request.id,
        semesterLabel: request.semesterLabel,
        semesterName: request.semesterName,
        dueDate: request.dueDate,
        submittedAt: request.submittedAt,
        status: request.status,
        studentName: request.studentName,
        universityName: request.universityName,
      }));
  }, [filteredRequests]);

  const selectedSemesterLabel =
    semesters.find((semester) => semester.id === filters.semester)?.label ??
    (filters.year || "All periods");

  return (
    <div className="space-y-6">
      <PageHeader
        size="lg"
        title="Dashboard"
        description="Overview of students and payment requests."
        actions={
          <DashboardFilters
            years={years}
            universities={universities}
            semesters={semesters}
            values={filters}
            onChange={setFilters}
          />
        }
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
            subtext={selectedSemesterLabel}
            icon={ClipboardList}
            tone="warning"
          />
          <StatCard
            label="Approved (Unpaid)"
            value={approvedUnpaid}
            subtext={selectedSemesterLabel}
            icon={CheckCircle}
            tone="accent"
          />
          <StatCard
            label="Paid"
            value={paidCount}
            subtext={selectedSemesterLabel}
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
                description="No requests need attention for the current filters."
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
