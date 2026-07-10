"use client";

import { useEffect, useState } from "react";

import { RequestsList } from "@/components/admin/requests-list";
import { TableSkeleton } from "@/components/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import {
  fetchActiveUniversities,
  type ActiveUniversity,
} from "@/lib/api/universities";
import {
  fetchRequests,
  fetchSemesterLabels,
  type RequestRecord,
} from "@/lib/api/requests";

export default function AdminRequestsPage() {
  requireAdmin();

  const [requests, setRequests] = useState<RequestRecord[] | null>(null);
  const [universities, setUniversities] = useState<ActiveUniversity[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetchRequests(),
      fetchActiveUniversities(),
      fetchSemesterLabels(),
    ])
      .then(([loadedRequests, loadedUniversities, labels]) => {
        setRequests(loadedRequests);
        setUniversities(loadedUniversities);
        setSemesters(labels);
      })
      .catch(() => setRequests([]));
  }, []);

  if (requests === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-3.5 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-7 w-24 rounded-full" />
              ))}
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full lg:w-48" />
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-border/70">
              <TableSkeleton columns={5} rows={6} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RequestsList
      requests={requests.map((request) => ({
        id: request.id,
        semesterLabel: request.semesterLabel,
        amountDue: request.amountDue.toString(),
        dueDate: request.dueDate?.toISOString() ?? null,
        submittedAt: request.submittedAt.toISOString(),
        status: request.status,
        adminNotes: request.adminNotes,
        internalNotes: request.paymentHistory?.internalNotes ?? null,
        student: {
          firstName: request.student.firstName,
          lastName: request.student.lastName,
          studentId: request.student.studentId,
          universityId: request.student.universityId,
          universityName: request.student.university?.name ?? null,
        },
      }))}
      universities={universities}
      semesters={semesters.map((semesterLabel) => ({ semesterLabel }))}
    />
  );
}
