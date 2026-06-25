import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireStudent } from "@/lib/auth/session";
import { BankForm, ContactForm } from "./profile-forms";

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
          Keep your contact and bank details up to date. Academic details are
          managed by the scholarship team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
            Your name and ID are managed by the team. You can update your phone
            number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="First name" value={student.firstName} />
            <Field label="Last name" value={student.lastName} />
            <Field label="Email" value={user.email} />
            <Field label="Student ID" value={student.studentId} />
            <Field label="Status" value={student.status} />
          </dl>
          <ContactForm phone={student.phone} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic information</CardTitle>
          <CardDescription>Managed by the scholarship team.</CardDescription>
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
          <CardDescription>
            Used for tuition payments. Keep this current.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BankForm
            bank={{
              bankAccountName: student.bankInformation?.bankAccountName ?? null,
              bankAccountNumber:
                student.bankInformation?.bankAccountNumber ?? null,
              bankName: student.bankInformation?.bankName ?? null,
              promptpayNumber: student.bankInformation?.promptpayNumber ?? null,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
