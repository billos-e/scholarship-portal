"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RequestCategoryPicker, openRequestsByCategory } from "@/components/student/request-category-picker";
import { SubmissionBlocked } from "@/components/student/submission-blocked";
import { SubmissionHero } from "@/components/student/submission-hero";
import { Button } from "@/components/ui/button";
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
import {
  parseRequestCategory,
  REQUEST_CATEGORY_LABELS,
} from "@/lib/request-category";

export default function StudentSubmitPage() {
  const { student: sessionStudent } = requireStudent();
  const searchParams = useSearchParams();
  const selectedCategory = parseRequestCategory(searchParams.get("category"));
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

  const openByCategory = openRequestsByCategory(
    student.tuitionPaymentRequests,
    BLOCKING_REQUEST_STATUSES,
  );

  const categoryOpen = selectedCategory
    ? (openByCategory[selectedCategory] ?? null)
    : null;

  const bank = student.bankInformation;
  const semesterHint =
    student.currentSemesterLabel ?? semesters[0]?.label ?? null;
  const profileReady = missingProfileFields.length === 0;

  const submittedSemesterIds = selectedCategory
    ? new Set(
        student.tuitionPaymentRequests
          .filter(
            (row) =>
              row.requestCategory === selectedCategory &&
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
        category={selectedCategory}
      />

      {!profileReady ? (
        <SubmissionBlocked
          missingProfileFields={missingProfileFields}
          openRequest={null}
        />
      ) : !selectedCategory ? (
        <RequestCategoryPicker
          hrefFor={(category) => `/student/submit?category=${category}`}
          openByCategory={openByCategory}
        />
      ) : categoryOpen ? (
        <div className="space-y-4">
          <ChangeTypeLink />
          <SubmissionBlocked
            missingProfileFields={[]}
            openRequest={{
              id: categoryOpen.id,
              semesterLabel: categoryOpen.semesterLabel,
              status: categoryOpen.status,
              requestCategory: selectedCategory,
            }}
          />
        </div>
      ) : availableSemesters.length > 0 || semesters.length === 0 ? (
        <div className="space-y-4">
          <ChangeTypeLink />
          <SubmissionForm
            requestCategory={selectedCategory}
            semesters={availableSemesters}
            defaults={{
              semesterLabel: student.currentSemesterLabel ?? "",
              bankAccountName: bank?.bankAccountName ?? "",
              bankAccountNumber: bank?.bankAccountNumber ?? "",
              bankName: bank?.bankName ?? "",
              promptpayNumber: bank?.promptpayNumber ?? "",
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <ChangeTypeLink />
          <Card className="border-border shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                No semesters available
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                You have already submitted a{" "}
                {REQUEST_CATEGORY_LABELS[selectedCategory].toLowerCase()}{" "}
                request for every active semester at your university. Choose a
                different payment type, or contact the scholarship team if you
                need to submit for a new term.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}

function ChangeTypeLink() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 px-2 text-muted-foreground"
      render={<Link href="/student/submit" />}
    >
      <ArrowLeft className="size-3.5" />
      Change payment type
    </Button>
  );
}
