"use client";

import { useEffect, useState } from "react";

import { HistoryRequestNav } from "@/components/student/history-request-nav";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireStudent } from "@/lib/auth/session";
import {
  fetchStudent,
  type StudentRequestRow,
} from "@/lib/api/students";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { student: sessionStudent } = requireStudent();
  const [requests, setRequests] = useState<StudentRequestRow[] | null>(null);

  useEffect(() => {
    fetchStudent(sessionStudent.id)
      .then((student) => setRequests(student?.tuitionPaymentRequests ?? []))
      .catch(() => setRequests([]));
  }, [sessionStudent.id]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Payment History"
        description="Your past semester submissions and their statuses."
        className="hidden md:flex"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-6">
        {requests === null ? (
          <Skeleton className="h-72 w-full rounded-2xl" />
        ) : (
          <HistoryRequestNav
            requests={requests.map((request) => ({
              id: request.id,
              semesterLabel: request.semesterLabel,
              amountDue: request.amountDue.toString(),
              submittedAt: request.submittedAt,
              status: request.status,
            }))}
          />
        )}

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
