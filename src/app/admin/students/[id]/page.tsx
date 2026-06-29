import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { ArchiveStudentButton } from "./archive-student-button";
import { StudentPasswordForm } from "./student-password-form";

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

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Students", href: "/admin/students" },
          { label: `${student.firstName} ${student.lastName}` },
        ]}
      />

      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        description={`${student.user.email} · ${student.studentId ?? "No ID"}`}
        actions={
          <>
            <StudentStatusBadge status={student.status} />
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/admin/students/${id}/edit`} />}
            >
              <Pencil />
              Edit
            </Button>
            {student.status === "ACTIVE" ? (
              <ArchiveStudentButton studentId={id} />
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="First name" value={student.firstName} />
              <Field label="Last name" value={student.lastName} />
              <Field label="Phone" value={student.phone} />
              <Field label="Email" value={student.user.email} />
              <Field label="Student ID" value={student.studentId} />
              <Field label="University" value={student.university?.name} />
              <Field label="Degree program" value={student.degreeProgram} />
              <Field label="Year of study" value={student.yearOfStudy} />
              <Field
                label="Current semester"
                value={student.currentSemesterLabel}
              />
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
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                label="PromptPay"
                value={student.bankInformation?.promptpayNumber}
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            {student.tuitionPaymentRequests.length} request(s) on record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {student.tuitionPaymentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semester</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.tuitionPaymentRequests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link
                        href={`/admin/requests/${r.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {r.semesterLabel}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(r.amountDue.toString())}
                    </TableCell>
                    <TableCell>{formatDate(r.submittedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Reset the student&apos;s login password.</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentPasswordForm userId={student.userId} />
        </CardContent>
      </Card>
    </div>
  );
}
