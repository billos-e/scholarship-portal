import Link from "next/link";
import { Pencil } from "lucide-react";

import { ProfileInfoCard } from "@/components/admin/profile-info-card";
import {
  ProfileInfoField,
  ProfileInfoGrid,
} from "@/components/admin/profile-info-field";
import { StudentDetailHero } from "@/components/admin/student-detail-hero";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";

export default function StudentProfilePage() {
  const { user, student } = requireStudent();
  const bank = student.bankInformation;
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="space-y-6">
      <StudentDetailHero
        firstName={student.firstName}
        lastName={student.lastName}
        studentIdNumber={student.studentId}
        universityId={null}
        universityName={student.university?.name ?? null}
        degreeProgram={student.degreeProgram}
        yearOfStudy={student.yearOfStudy}
        currentSemesterLabel={student.currentSemesterLabel}
        gpa={student.gpa ? student.gpa.toString() : null}
        status={student.status}
        photoUrl={student.photoUrl}
        headerAction={
          <Button
            size="sm"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
            render={<Link href="/student/profile/edit" />}
          >
            <Pencil className="size-3.5" />
            Edit profile
          </Button>
        }
      />

      <ProfileInfoCard title="Personal information">
        <ProfileInfoGrid>
          <ProfileInfoField label="First name" value={student.firstName} />
          <ProfileInfoField label="Last name" value={student.lastName} />
          <ProfileInfoField label="Student ID" value={student.studentId} />
          <ProfileInfoField label="Email address">
            <a
              href={`mailto:${user.email}`}
              className="text-primary underline-offset-4 transition-colors hover:underline"
            >
              {user.email}
            </a>
          </ProfileInfoField>
          <ProfileInfoField label="Phone number" value={student.phone} />
          <ProfileInfoField label="Account status">
            <StudentStatusBadge status={student.status} />
          </ProfileInfoField>
          <ProfileInfoField
            label="Member since"
            value={formatDate(student.createdAt)}
          />
        </ProfileInfoGrid>
      </ProfileInfoCard>

      <ProfileInfoCard title="Academic information">
        <ProfileInfoGrid>
          <ProfileInfoField
            label="University"
            value={student.university?.name ?? null}
          />
          <ProfileInfoField
            label="Degree program"
            value={student.degreeProgram}
          />
          <ProfileInfoField
            label="Year of study"
            value={student.yearOfStudy}
          />
          <ProfileInfoField
            label="Current semester"
            value={student.currentSemesterLabel}
          />
          <ProfileInfoField
            label="GPA"
            value={student.gpa ? student.gpa.toString() : null}
          />
        </ProfileInfoGrid>
      </ProfileInfoCard>

      <ProfileInfoCard title="Bank information">
        {bank?.bankName || bank?.bankAccountNumber ? (
          <ProfileInfoGrid>
            <ProfileInfoField label="Bank name" value={bank.bankName} />
            <ProfileInfoField
              label="Account holder"
              value={bank.bankAccountName}
            />
            <ProfileInfoField
              label="Account number"
              value={bank.bankAccountNumber}
            />
            <ProfileInfoField
              label="PromptPay"
              value={bank.promptpayNumber}
            />
          </ProfileInfoGrid>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No bank details on file.{" "}
            <Link
              href="/student/profile/edit"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Add bank information
            </Link>
          </p>
        )}
      </ProfileInfoCard>
    </div>
  );
}
