import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth/session";
import { getLatestRequestForStudent } from "@/lib/stub/sample-data";

export default function StudentHistoryIndexPage() {
  const { student } = requireStudent();
  const eligibility = {
    canStart: true,
    missingProfileFields: [] as string[],
    openRequest: null as { id: string; semesterLabel: string } | null,
  };

  const first = getLatestRequestForStudent(student.id);

  if (first) {
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
