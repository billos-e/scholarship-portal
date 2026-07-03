import { SubmissionBlocked } from "@/components/student/submission-blocked";
import { SubmissionHero } from "@/components/student/submission-hero";
import { requireStudent } from "@/lib/auth/session";
import {
  getRequestsForStudent,
  getUniversitySemesters,
} from "@/lib/stub/sample-data";
import { SubmissionForm } from "./submit-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StudentSubmitPage() {
  const { student } = requireStudent();
  const eligibility = {
    canStart: true,
    missingProfileFields: [],
    openRequest: null as { id: string; semesterLabel: string; status: string } | null,
  };
  const bank = student.bankInformation;

  const semesterHint =
    student.currentSemesterLabel ??
    (student.universityId
      ? getUniversitySemesters(student.universityId, true)[0]?.label ?? null
      : null);

  const semesters = student.universityId
    ? getUniversitySemesters(student.universityId, true)
    : [];

  const submittedSemesterIds = eligibility.canStart
    ? new Set(
        getRequestsForStudent(student.id)
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
