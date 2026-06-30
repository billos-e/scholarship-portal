import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { requireStudent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getStudentAcademicOptions } from "@/lib/student-academic-options";
import { BankForm, StudentProfileForm } from "./profile-forms";
import { ProfilePhotoForm } from "./profile-photo-form";

export default async function StudentProfilePage() {
  const { user, student } = await requireStudent();

  const [universities, academicOptions] = await Promise.all([
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getStudentAcademicOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and update your personal, academic, and bank details."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Keep your contact and academic information up to date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfilePhotoForm
            photoUrl={student.photoUrl}
            name={`${student.firstName} ${student.lastName}`}
          />
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <StudentStatusBadge status={student.status} />
          </div>
          <StudentProfileForm
            profile={{
              firstName: student.firstName,
              lastName: student.lastName,
              email: user.email ?? "",
              studentId: student.studentId,
              phone: student.phone,
              universityId: student.universityId,
              degreeProgram: student.degreeProgram,
              yearOfStudy: student.yearOfStudy,
              currentSemesterLabel: student.currentSemesterLabel,
              gpa: student.gpa ? student.gpa.toString() : null,
            }}
            universities={universities}
            academicOptions={academicOptions}
          />
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
