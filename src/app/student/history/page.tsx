import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function StudentHistoryIndexPage() {
  const { student } = await requireStudent();

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
      description="Select a submission from the list or start a new semester submission."
      action={
        <Button render={<Link href="/student/submit" />}>New Submission</Button>
      }
    />
  );
}
