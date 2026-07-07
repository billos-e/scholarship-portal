"use client";

import { useEffect, useState } from "react";

import { RequestsList } from "@/components/admin/requests-list";
import { Skeleton } from "@/components/ui/skeleton";
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
        <Skeleton className="h-96 w-full rounded-2xl" />
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
