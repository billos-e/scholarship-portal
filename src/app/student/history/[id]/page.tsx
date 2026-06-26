import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ImageIcon } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireStudent } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  ACTIVITY_OPTIONS,
  CHALLENGE_OPTIONS,
  labelFor,
  WELLBEING_QUESTIONS,
} from "@/lib/submissions/constants";

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">
        {value === null || value === undefined || value === "" ? "—" : value}
      </dd>
    </div>
  );
}

function FileLink({
  label,
  url,
  icon: Icon,
}: {
  label: string;
  url: string | null;
  icon: typeof FileText;
}) {
  if (!url) {
    return <Field label={label} />;
  }
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd>
        <a
          href={`/api/uploads/${url}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <Icon className="size-4" />
          Open file
        </a>
      </dd>
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function WellbeingValue({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`size-2.5 rounded-full ${
            n <= value ? "bg-primary" : "bg-muted"
          }`}
          aria-hidden
        />
      ))}
      <span className="ml-2 text-sm font-medium">{value}/5</span>
    </div>
  );
}

export default async function StudentSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { student } = await requireStudent();

  const request = await prisma.tuitionPaymentRequest.findUnique({
    where: { id },
    include: { semesterReport: true, paymentHistory: true },
  });

  if (!request || request.studentId !== student.id) {
    notFound();
  }

  const report = request.semesterReport;
  const payment = request.paymentHistory;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {request.semesterLabel}
          </h1>
          <p className="text-muted-foreground">
            Submitted {formatDate(request.submittedAt)}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          render={<Link href="/student/history" />}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Tuition payment</CardTitle>
            <CardDescription>
              Current status of this payment request.
            </CardDescription>
          </div>
          <StatusBadge status={request.status} />
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Amount due"
              value={formatCurrency(request.amountDue.toString())}
            />
            <Field label="Due date" value={formatDate(request.dueDate)} />
            <Field label="Submitted" value={formatDate(request.submittedAt)} />
            <Field label="Reviewed" value={formatDate(request.reviewedAt)} />
            <Field label="Approved" value={formatDate(request.approvedAt)} />
            <Field label="Paid" value={formatDate(request.paidAt)} />
            <FileLink
              label="Invoice"
              url={request.invoiceFileUrl}
              icon={FileText}
            />
          </dl>
          {payment ? (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Payment recorded</p>
              <p className="text-muted-foreground">
                {formatCurrency(payment.amountPaid.toString())} on{" "}
                {formatDate(payment.paymentDate)}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank snapshot</CardTitle>
          <CardDescription>
            The bank details captured at the time of submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Account name" value={request.bankAccountName} />
            <Field label="Account number" value={request.bankAccountNumber} />
            <Field label="Bank name" value={request.bankName} />
            <Field label="PromptPay" value={request.promptpayNumber} />
            <FileLink
              label="QR image"
              url={request.qrPaymentImageUrl}
              icon={ImageIcon}
            />
          </dl>
        </CardContent>
      </Card>

      {report ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Academic report</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field
                  label="GPA"
                  value={report.gpa ? report.gpa.toString() : null}
                />
                <Field
                  label="Credits completed"
                  value={report.creditsCompleted ?? null}
                />
                <Field
                  label="Passed all courses"
                  value={
                    report.passedAllCourses === null
                      ? null
                      : report.passedAllCourses
                        ? "Yes"
                        : "No"
                  }
                />
                <FileLink
                  label="Transcript"
                  url={report.transcriptFileUrl}
                  icon={FileText}
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wellbeing</CardTitle>
              <CardDescription>How you rated yourself (1–5).</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {WELLBEING_QUESTIONS.map((q) => {
                  const value = report[
                    q.name as keyof typeof report
                  ] as number | null;
                  return (
                    <li
                      key={q.name}
                      className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm">{q.label}</span>
                      <WellbeingValue value={value} />
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Challenges
                </p>
                <Tags
                  items={report.challenges.map((c) =>
                    labelFor(CHALLENGE_OPTIONS, c),
                  )}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Activities
                </p>
                <Tags
                  items={report.activities.map((a) =>
                    labelFor(ACTIVITY_OPTIONS, a),
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reflections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field
                label="Biggest achievement"
                value={report.reflectionAchievement}
              />
              <Field
                label="Biggest challenge"
                value={report.reflectionChallenge}
              />
              <Field
                label="Anything else"
                value={report.reflectionAdditional}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Semester report</CardTitle>
            <CardDescription>
              No report was submitted with this request.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
