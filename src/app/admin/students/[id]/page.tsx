import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StudentEditForm } from "./student-edit-form";
import { StudentBankForm } from "./student-bank-form";
import { StudentPasswordForm } from "./student-password-form";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [student, universities] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        university: true,
        bankInformation: true,
        _count: { select: { tuitionPaymentRequests: true } },
      },
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
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          render={<Link href="/admin/students" />}
        >
          <ArrowLeft /> Back to students
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {student.firstName} {student.lastName}
          </h1>
          <StudentStatusBadge status={student.status} />
        </div>
        <p className="text-muted-foreground">
          {student.user.email} · {student._count.tuitionPaymentRequests} payment
          request(s)
        </p>
      </div>

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
          <CardDescription>
            Latest known bank details for this student.
          </CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Reset the student&apos;s login password. Login access is controlled by
            the profile status above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentPasswordForm userId={student.userId} />
        </CardContent>
      </Card>
    </div>
  );
}
