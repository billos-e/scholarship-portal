"use client";

import { useEffect, useState } from "react";

import { SubmissionBlocked } from "@/components/student/submission-blocked";
import { SubmissionHero } from "@/components/student/submission-hero";
import { Skeleton } from "@/components/ui/skeleton";
import { requireStudent } from "@/lib/auth/session";
import { fetchStudent, type StudentDetail } from "@/lib/api/students";
import {
  fetchUniversitySemesters,
  type UniversitySemesterRow,
} from "@/lib/api/academic";
import { SubmissionForm } from "./submit-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BLOCKING_REQUEST_STATUSES,
  getMissingProfileFields,
  type StudentForEligibility,
  type ProfileField,
} from "@/lib/submissions/eligibility";

export default function StudentSubmitPage() {
  const { student: sessionStudent } = requireStudent();
  const [student, setStudent] = useState<StudentDetail | null | undefined>(
    undefined,
  );
  const [semesters, setSemesters] = useState<UniversitySemesterRow[]>([]);

  useEffect(() => {
    fetchStudent(sessionStudent.id)
      .then(async (loaded) => {
        setStudent(loaded);
        if (loaded?.universityId) {
          const rows = await fetchUniversitySemesters(loaded.universityId, true);
          setSemesters(rows);
        } else {
          setSemesters([]);
        }
      })
      .catch(() => setStudent(null));
  }, [sessionStudent.id]);

  if (student === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!student) {
    return (
      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Profile unavailable
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            We couldn&apos;t load your profile. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const missingProfileFields = getMissingProfileFields(
    student as unknown as StudentForEligibility,
  ) as ProfileField[];

  const openRequest =
    student.tuitionPaymentRequests.find((r) =>
      BLOCKING_REQUEST_STATUSES.includes(r.status),
    ) ?? null;

  const eligibility = {
    canStart: missingProfileFields.length === 0 && openRequest === null,
    missingProfileFields,
    openRequest: openRequest
      ? {
          id: openRequest.id,
          semesterLabel: openRequest.semesterLabel,
          status: openRequest.status,
        }
      : null,
  };
  const bank = student.bankInformation;

  const semesterHint =
    student.currentSemesterLabel ?? semesters[0]?.label ?? null;

  const submittedSemesterIds = eligibility.canStart
    ? new Set(
        student.tuitionPaymentRequests
          .filter(
            (row) =>
              row.universitySemesterId !== null &&
              row.status !== "REJECTED",
          )
          .map((row) => row.universitySemesterId)
          .filter((id): id is string => id !== null),
      )
    : new Set<string>();

  const availableSemesters = semesters.filter(
    (semester) => !submittedSemesterIds.has(semester.id),
  );

  return (
    <div className="space-y-6">
      <SubmissionHero
        firstName={student.firstName}
        universityName={student.university?.name ?? null}
        semesterHint={semesterHint}
      />

      {eligibility.canStart ? (
        availableSemesters.length > 0 ? (
          <SubmissionForm
            semesters={availableSemesters}
            defaults={{
              semesterLabel: student.currentSemesterLabel ?? "",
              bankAccountName: bank?.bankAccountName ?? "",
              bankAccountNumber: bank?.bankAccountNumber ?? "",
              bankName: bank?.bankName ?? "",
              promptpayNumber: bank?.promptpayNumber ?? "",
            }}
          />
        ) : (
          <Card className="border-border shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                No semesters available
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                You have already submitted for every active semester at your
                university. Contact the scholarship team if you need to submit
                for a new term.
              </CardDescription>
            </CardHeader>
          </Card>
        )
      ) : (
        <SubmissionBlocked
          missingProfileFields={eligibility.missingProfileFields}
          openRequest={eligibility.openRequest}
        />
      )}
    </div>
  );
}
