import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireStudent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SubmissionForm } from "./submit-form";

export default async function StudentSubmitPage() {
  const { student } = await requireStudent();
  const bank = student.bankInformation;

  const semesters = student.universityId
    ? await prisma.universitySemester.findMany({
        where: { universityId: student.universityId, isActive: true },
        orderBy: { startDate: "desc" },
        select: { id: true, label: true, startDate: true },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Submission"
        description="Submit your tuition payment request and semester report together. All information is kept private to you and the scholarship team."
      />

      <Card>
        <CardHeader>
          <CardTitle>Semester Submission</CardTitle>
          <CardDescription>
            Fill in every section. Required fields are marked with an asterisk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionForm
            semesters={semesters}
            defaults={{
              semesterLabel: student.currentSemesterLabel ?? "",
              bankAccountName: bank?.bankAccountName ?? "",
              bankAccountNumber: bank?.bankAccountNumber ?? "",
              bankName: bank?.bankName ?? "",
              promptpayNumber: bank?.promptpayNumber ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
