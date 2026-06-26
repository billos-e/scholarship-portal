import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireStudent } from "@/lib/auth/session";
import { SubmissionForm } from "./submit-form";

export default async function StudentSubmitPage() {
  const { student } = await requireStudent();
  const bank = student.bankInformation;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Semester Submission
        </h1>
        <p className="text-muted-foreground">
          Submit your tuition payment request and semester report together. All
          information is kept private to you and the scholarship team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission</CardTitle>
          <CardDescription>
            Fill in every section. Required fields are marked with an asterisk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionForm
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
