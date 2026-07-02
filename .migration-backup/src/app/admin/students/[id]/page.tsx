import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Receipt } from "lucide-react";

import { ProfileInfoCard } from "@/components/admin/profile-info-card";
import {
  ProfileInfoField,
  ProfileInfoGrid,
} from "@/components/admin/profile-info-field";
import { RequestSectionCard } from "@/components/admin/request-section-card";
import { StudentDetailHero } from "@/components/admin/student-detail-hero";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PaymentRequestsTable } from "@/components/payment-requests-table";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { ArchiveStudentButton } from "./archive-student-button";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      university: true,
      bankInformation: true,
      tuitionPaymentRequests: {
        orderBy: { submittedAt: "desc" },
        take: 20,
      },
    },
  });

  if (!student) notFound();

  const fullName = `${student.firstName} ${student.lastName}`;
  const paymentCount = student.tuitionPaymentRequests.length;
  const editHref = `/admin/students/${id}/edit`;
  const bank = student.bankInformation;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Students", href: "/admin/students" },
          { label: fullName },
        ]}
      />

      <StudentDetailHero
        firstName={student.firstName}
        lastName={student.lastName}
        studentIdNumber={student.studentId}
        universityId={student.universityId}
        universityName={student.university?.name ?? null}
        degreeProgram={student.degreeProgram}
        yearOfStudy={student.yearOfStudy}
        currentSemesterLabel={student.currentSemesterLabel}
        gpa={student.gpa ? student.gpa.toString() : null}
        status={student.status}
        photoUrl={student.photoUrl}
        headerAction={
          <>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              render={<Link href={editHref} />}
            >
              <Pencil className="size-3.5" />
              Edit profile
            </Button>
            {student.status === "ACTIVE" ? (
              <ArchiveStudentButton studentId={id} />
            ) : null}
          </>
        }
      />

      <ProfileInfoCard title="Personal information">
        <ProfileInfoGrid>
          <ProfileInfoField label="First name" value={student.firstName} />
          <ProfileInfoField label="Last name" value={student.lastName} />
          <ProfileInfoField label="Student ID" value={student.studentId} />
          <ProfileInfoField label="Email address">
            <a
              href={`mailto:${student.user.email}`}
              className="text-primary underline-offset-4 transition-colors hover:underline"
            >
              {student.user.email}
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
          <ProfileInfoField
            label="Payment requests"
            value={
              paymentCount === 0
                ? "None"
                : `${paymentCount} on record`
            }
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
            No bank details on file.
          </p>
        )}
      </ProfileInfoCard>

      <RequestSectionCard
        title="Payment history"
        description={
          paymentCount === 0
            ? "No tuition payment requests on record."
            : `${paymentCount} request${paymentCount === 1 ? "" : "s"} on record.`
        }
        icon={Receipt}
        tone="accent"
      >
        {paymentCount === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            This student has not submitted any tuition payment requests yet.
          </p>
        ) : (
          <PaymentRequestsTable
            rows={student.tuitionPaymentRequests.map((request) => ({
              id: request.id,
              semesterLabel: request.semesterLabel,
              amountDue: request.amountDue.toString(),
              submittedAt: request.submittedAt.toISOString(),
              status: request.status,
              href: `/admin/requests/${request.id}`,
            }))}
          />
        )}
      </RequestSectionCard>
    </div>
  );
}
