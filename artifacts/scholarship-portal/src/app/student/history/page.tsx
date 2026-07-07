"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireStudent } from "@/lib/auth/session";
import { fetchStudent } from "@/lib/api/students";

export default function StudentHistoryIndexPage() {
  const { student: sessionStudent } = requireStudent();
  const [loading, setLoading] = useState(true);

  const eligibility = {
    canStart: true,
    missingProfileFields: [] as string[],
    openRequest: null as { id: string; semesterLabel: string } | null,
  };

  useEffect(() => {
    let active = true;
    fetchStudent(sessionStudent.id)
      .then((student) => {
        if (!active) return;
        const first = student?.tuitionPaymentRequests[0] ?? null;
        if (first) {
          redirect(`/student/history/${first.id}`);
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionStudent.id]);

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  return (
    <EmptyState
      title="No submissions yet"
      description={
        eligibility.canStart
          ? "Select a submission from the list or start a new semester submission."
          : eligibility.missingProfileFields.length > 0
            ? "Complete your profile before starting your first submission."
            : "Finish or resolve your current request before starting another."
      }
      action={
        eligibility.canStart ? (
          <Button render={<Link href="/student/submit" />}>New Submission</Button>
        ) : eligibility.missingProfileFields.length > 0 ? (
          <Button render={<Link href="/student/profile/edit" />}>
            Complete profile
          </Button>
        ) : null
      }
    />
  );
}
