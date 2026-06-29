import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StudentEditForm } from "../student-edit-form";
import { StudentBankForm } from "../student-bank-form";
import { AdminStudentPhotoForm } from "./student-photo-form";

export default async function StudentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [student, universities] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: { bankInformation: true },
    }),
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!student) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Students", href: "/admin/students" },
          {
            label: `${student.firstName} ${student.lastName}`,
            href: `/admin/students/${id}`,
          },
          { label: "Edit" },
        ]}
      />

      <PageHeader
        title="Edit Student"
        description={`${student.firstName} ${student.lastName}`}
        actions={
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/admin/students/${id}`} />}
          >
            <ArrowLeft />
            Back to profile
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminStudentPhotoForm
            studentId={student.id}
            photoUrl={student.photoUrl}
            name={`${student.firstName} ${student.lastName}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Edit the student profile and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentEditForm
            universities={universities}
            student={{
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              studentId: student.studentId,
              phone: student.phone,
              universityId: student.universityId,
              degreeProgram: student.degreeProgram,
              yearOfStudy: student.yearOfStudy,
              currentSemesterLabel: student.currentSemesterLabel,
              gpa: student.gpa ? student.gpa.toString() : null,
              status: student.status,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank information</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentBankForm
            bank={{
              studentId: student.id,
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
