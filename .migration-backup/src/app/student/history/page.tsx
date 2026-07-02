import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getSubmissionEligibility } from "@/lib/submissions/eligibility";

export default async function StudentHistoryIndexPage() {
  const { student } = await requireStudent();
  const eligibility = await getSubmissionEligibility(student);

  const first = await prisma.tuitionPaymentRequest.findFirst({
    where: { studentId: student.id },
    orderBy: { submittedAt: "desc" },
    select: { id: true },
  });

  if (first) {
    const { redirect } = await import("next/navigation");
    redirect(`/student/history/${first.id}`);
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
