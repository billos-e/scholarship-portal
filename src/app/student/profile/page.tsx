import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireStudent } from "@/lib/auth/session";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{value && value.length > 0 ? value : "—"}</dd>
    </div>
  );
}

export default async function StudentProfilePage() {
  const { user, student } = await requireStudent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Your scholarship profile details. Editing will be available soon.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="First name" value={student.firstName} />
            <Field label="Last name" value={student.lastName} />
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={student.phone} />
            <Field label="Student ID" value={student.studentId} />
            <Field label="Status" value={student.status} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="University" value={student.university?.name} />
            <Field label="Degree program" value={student.degreeProgram} />
            <Field label="Year of study" value={student.yearOfStudy} />
            <Field label="Current semester" value={student.currentSemesterLabel} />
            <Field
              label="GPA"
              value={student.gpa ? student.gpa.toString() : null}
            />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Account name"
              value={student.bankInformation?.bankAccountName}
            />
            <Field
              label="Account number"
              value={student.bankInformation?.bankAccountNumber}
            />
            <Field label="Bank name" value={student.bankInformation?.bankName} />
            <Field
              label="PromptPay number"
              value={student.bankInformation?.promptpayNumber}
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
