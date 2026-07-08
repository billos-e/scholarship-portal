"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  CreditCard,
  FileText,
  GraduationCap,
  Heart,
  MessageSquare,
  Tags,
} from "lucide-react";

import { AdminNotesComment } from "@/components/admin/admin-notes-comment";
import { BankCard } from "@/components/admin/bank-card";
import {
  DetailField,
  DetailFileLink,
} from "@/components/admin/detail-field";
import { InvoiceDocument } from "@/components/admin/invoice-document";
import { ScreenshotDocument } from "@/components/admin/screenshot-document";
import { RequestDetailHero } from "@/components/admin/request-detail-hero";
import { RequestSectionCard } from "@/components/admin/request-section-card";
import {
  ContextPanel,
  WellbeingGrid,
} from "@/components/admin/wellbeing-context";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { fetchRequest, type RequestDetail } from "@/lib/api/requests";
import {
  ACTIVITY_OPTIONS,
  CHALLENGE_OPTIONS,
  labelFor,
  WELLBEING_QUESTIONS,
} from "@/lib/submissions/constants";
import NotFound from "@/pages/not-found";
import { PaymentNotesForm } from "./status-actions";

export default function AdminRequestDetailPage() {
  requireAdmin();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDetail | null | undefined>(
    undefined,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    fetchRequest(id)
      .then(setRequest)
      .catch(() => setRequest(null));
  }, [id, refreshKey]);

  if (request === undefined) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!request) return <NotFound />;

  const { student, semesterReport: report, paymentHistory: payment } = request;
  const studentName = `${student.firstName} ${student.lastName}`;

  const wellbeingItems = report
    ? WELLBEING_QUESTIONS.map((q) => ({
        name: q.name,
        label: q.label,
        value: report[q.name as keyof typeof report] as number | null,
      }))
    : [];

  return (
    <div className="space-y-8">
      <RequestDetailHero
        studentId={student.id}
        studentName={studentName}
        semesterLabel={request.semesterLabel}
        email={student.user.email}
        universityName={student.university?.name ?? null}
        universityId={student.universityId}
        submittedLabel={formatDate(request.submittedAt)}
        status={request.status}
        amountDue={formatCurrency(request.amountDue.toString())}
        dueDateLabel={formatDate(request.dueDate)}
        gpa={report?.gpa ? report.gpa.toString() : null}
        requestId={request.id}
        amountDueRaw={request.amountDue.toString()}
        paidAt={request.paidAt}
        onSuccess={refresh}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <InvoiceDocument url={request.invoiceFileUrl} />
          <ScreenshotDocument url={request.qrPaymentImageUrl} />

          <BankCard
            accountName={request.bankAccountName}
            accountNumber={request.bankAccountNumber}
            bankName={request.bankName}
            promptpayNumber={request.promptpayNumber}
            qrImageUrl={null}
          />

          {report ? (
            <>
              <RequestSectionCard
                title="Academic report"
                description="Semester performance and supporting documents."
                icon={GraduationCap}
                tone="success"
              >
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="GPA"
                    value={report.gpa ? report.gpa.toString() : null}
                  />
                  <DetailField
                    label="Credits completed"
                    value={report.creditsCompleted ?? null}
                  />
                  <DetailField
                    label="Passed all courses"
                    value={
                      report.passedAllCourses === null
                        ? null
                        : report.passedAllCourses
                          ? "Yes"
                          : "No"
                    }
                  />
                  <DetailFileLink
                    label="Transcript"
                    url={report.transcriptFileUrl}
                    icon={FileText}
                  />
                </dl>
              </RequestSectionCard>

              <RequestSectionCard
                title="Wellbeing"
                description="How the student rated their semester experience."
                icon={Heart}
                tone="warning"
              >
                <WellbeingGrid items={wellbeingItems} />
              </RequestSectionCard>

              <RequestSectionCard
                title="Context"
                description="Challenges and activities outside the classroom."
                icon={Tags}
                tone="info"
              >
                <ContextPanel
                  challenges={report.challenges.map((c) =>
                    labelFor(CHALLENGE_OPTIONS, c),
                  )}
                  activities={report.activities.map((a) =>
                    labelFor(ACTIVITY_OPTIONS, a),
                  )}
                />
              </RequestSectionCard>

              <RequestSectionCard
                title="Reflections"
                description="Student-written responses about their semester."
                icon={MessageSquare}
                tone="primary"
              >
                <dl className="grid grid-cols-1 gap-3">
                  <DetailField
                    label="Biggest achievement"
                    value={report.reflectionAchievement}
                  />
                  <DetailField
                    label="Biggest challenge"
                    value={report.reflectionChallenge}
                  />
                  <DetailField
                    label="Anything else"
                    value={report.reflectionAdditional}
                  />
                </dl>
              </RequestSectionCard>
            </>
          ) : (
            <RequestSectionCard
              title="Semester report"
              description="No report was submitted with this request."
              icon={BookOpen}
              tone="accent"
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                The student did not attach a semester report to this payment
                request.
              </p>
            </RequestSectionCard>
          )}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
            <AdminNotesComment
              requestId={request.id}
              value={request.adminNotes ?? ""}
              onSuccess={refresh}
            />
          </div>

          {payment ? (
            <RequestSectionCard
              title="Payment record"
              description="Created when the request was marked as paid."
              icon={CreditCard}
              tone="success"
            >
              <div className="space-y-5">
                <dl className="grid grid-cols-2 gap-3">
                  <DetailField
                    label="Amount paid"
                    value={formatCurrency(payment.amountPaid.toString())}
                  />
                  <DetailField
                    label="Payment date"
                    value={formatDate(payment.paymentDate)}
                  />
                </dl>
                <PaymentNotesForm
                  requestId={request.id}
                  value={payment.internalNotes ?? ""}
                  onSuccess={refresh}
                />
              </div>
            </RequestSectionCard>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
