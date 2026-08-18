"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  Pencil,
  Receipt,
  Clock,
  CheckCircle2,
  GraduationCap,
  User,
  Mail,
  Phone,
  Landmark,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";

import Image from "next/image";

import { StudentStatusBadge } from "@/components/student-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { RequestCategoryBadge } from "@/components/request-category-badge";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate, formatCurrency } from "@/lib/format";
import { getInitials } from "@/lib/initials";
import { fetchStudent, type StudentDetail } from "@/lib/api/students";
import { hasAnyBankField } from "@/lib/bank-accounts";
import { formatEthnicity } from "@/lib/ethnicity-options";
import { RELIGION_LABELS } from "@/lib/religion";
import { SCHOLARSHIP_TYPE_LABELS } from "@/lib/scholarship-type";
import { uploadPublicUrl } from "@/lib/upload-path";
import {
  getMissingProfileFields,
  PROFILE_FIELD_LABELS,
  type StudentForEligibility,
} from "@/lib/submissions/eligibility";
import NotFound from "@/pages/not-found";
import { ArchiveStudentButton } from "./archive-student-button";
import { ActivateStudentButton } from "./activate-student-button";

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied.`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 group cursor-pointer"
      aria-label={`Copy ${label.toLowerCase()}`}
    >
      <span className="font-mono font-medium text-foreground group-hover:text-primary transition-colors">
        {value}
      </span>
      {copied ? (
        <Check className="size-3.5 text-success shrink-0" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
      )}
    </button>
  );
}

export default function StudentDetailPage() {
  requireAdmin();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentDetail | null | undefined>(
    undefined,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    fetchStudent(id)
      .then(setStudent)
      .catch(() => setStudent(null));
  }, [id, refreshKey]);

  if (student === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!student) return <NotFound />;

  const fullName = `${student.firstName} ${student.lastName}`;
  const initials = getInitials(fullName);
  const editHref = `/admin/students/${id}/edit`;
  const bankAccounts = student.bankAccounts ?? [];
  const hasBank = bankAccounts.some((account) => hasAnyBankField(account));
  const missingFields = getMissingProfileFields(student as unknown as StudentForEligibility);

  const requests = student.tuitionPaymentRequests;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Students", href: "/admin/students" },
          { label: fullName },
        ]}
      />

      {missingFields.length > 0 && student.status === "ACTIVE" && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div className="min-w-0">
              <p className="font-medium text-warning-foreground">Profile incomplete</p>
              <p className="mt-0.5 text-muted-foreground">
                Missing:{" "}
                {missingFields.map((f) => PROFILE_FIELD_LABELS[f]).join(", ")}
                .{" "}
                <Link
                  href={editHref}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Complete profile
                </Link>{" "}
                so this student can submit requests.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-md sm:size-24 bg-primary text-2xl font-medium text-primary-foreground">
            {student.photoUrl?.trim() ? (
              <Image
                src={uploadPublicUrl(student.photoUrl)}
                alt={fullName}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                {fullName}
              </h1>
              <StudentStatusBadge status={student.status} />
            </div>
            <p className="text-muted-foreground text-base sm:text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {student.university ? (
                <Link
                  href={`/admin/universities/${student.university.id}`}
                  className="hover:text-foreground hover:underline transition-colors"
                >
                  {student.university.name}
                </Link>
              ) : (
                "—"
              )}
              {student.degreeProgram ? (
                <>
                  <span aria-hidden className="text-border">
                    ·
                  </span>
                  {student.degreeProgram}
                </>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5 gap-2"
            render={<Link href={editHref} />}
            nativeButton={false}
          >
            <Pencil className="size-3.5" />
            Edit Profile
          </Button>
          {student.status === "ACTIVE" ? (
            <ArchiveStudentButton studentId={id} onSuccess={refresh} />
          ) : (
            <ActivateStudentButton studentId={id} onSuccess={refresh} />
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Timeline Column */}
        <main className="lg:col-span-8">
          <h2 className="text-lg font-semibold mb-6 tracking-tight flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Student Journey
          </h2>

          <div className="relative border-l border-border ml-4 space-y-10 pb-8">
            {/* Current Status Event */}
            <TimelineEvent
              dotColor="bg-success-light border-background"
              dotInner={<CheckCircle2 className="h-4 w-4 text-success" />}
              dateLabel="Present"
            >
              <Card className="shadow-sm border-border/80">
                <CardContent className="p-5 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-success-light flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {student.status === "GRADUATED"
                        ? "Graduated"
                        : student.status === "ACTIVE"
                          ? "Active Student"
                          : "Inactive"}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {student.status === "GRADUATED"
                        ? `Successfully completed the ${student.degreeProgram ?? ""} program at ${student.university?.name ?? ""}.`
                        : student.status === "ACTIVE"
                          ? `Currently enrolled in ${student.degreeProgram ?? ""} at ${student.university?.name ?? ""}.`
                          : "This student is currently inactive."}
                    </p>
                    {student.gpa ? (
                      <div className="flex gap-4 mt-3 text-sm text-foreground">
                        <Badge variant="outline">
                          Final GPA: {student.gpa}
                        </Badge>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TimelineEvent>

            {/* Payment Requests */}
            {requests.map((request) => (
              <TimelineEvent
                key={request.id}
                dotColor="bg-info-light border-background"
                dotInner={
                  <div className="h-2 w-2 rounded-full bg-info" />
                }
                dateLabel={formatDate(request.submittedAt)}
              >
                <Link
                  href={`/admin/requests/${request.id}`}
                  className="block"
                >
                  <Card className="shadow-sm border-border/80 cursor-pointer hover:border-primary/40 transition-colors">
                    <CardContent className="p-5 flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-info-light flex items-center justify-center shrink-0">
                        <Receipt className="h-5 w-5 text-info" />
                      </div>
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h3 className="font-semibold text-foreground">
                            Payment Request{" "}
                            <StatusBadge status={request.status} />
                          </h3>
                          <RequestCategoryBadge category={request.requestCategory} />
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {request.semesterLabel} semester{" "}
                          {request.requestCategory === "TUITION"
                            ? "tuition fee"
                            : "payment"}{" "}
                          requested.
                        </p>
                        <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between border border-border/50">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                              Amount
                            </p>
                            <p className="font-medium text-foreground">
                              {formatCurrency(request.amountDue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                              Semester
                            </p>
                            <p className="font-medium text-foreground">
                              {request.semesterLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </TimelineEvent>
            ))}

            {/* Academic Progress Event */}
            <TimelineEvent
              dotColor="bg-muted border-background"
              dotInner={<div className="h-2 w-2 rounded-full bg-muted-foreground" />}
              dateLabel={student.currentSemesterLabel ?? "Recent"}
            >
              <Card className="shadow-sm border-border/80 border-dashed bg-muted/20">
                <CardContent className="p-5 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      Academic Progress
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {student.yearOfStudy
                        ? `Year ${student.yearOfStudy}`
                        : ""}
                      {student.currentSemesterLabel
                        ? `${student.yearOfStudy ? ", " : ""}${student.currentSemesterLabel}`
                        : ""}
                      {student.gpa
                        ? `. Maintained GPA of ${student.gpa}.`
                        : student.yearOfStudy || student.currentSemesterLabel
                          ? "."
                          : "No academic details on file."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TimelineEvent>

            {/* Profile Created Event */}
            <TimelineEvent
              dotColor="bg-muted border-background"
              dotInner={<div className="h-2 w-2 rounded-full bg-muted-foreground" />}
              dateLabel={formatDate(student.createdAt)}
            >
              <Card className="shadow-sm border-border/80 bg-muted/20">
                <CardContent className="p-5 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      Profile Created
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Student ID {student.studentId} assigned.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TimelineEvent>
          </div>
        </main>

        {/* Sticky Side Panel */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Contact Info */}
          <Card className="shadow-sm border-border/80 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <SideFact label="Email Address" value={student.user.email} />
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <SideFactRow>
                  <SideFact label="Phone Number" value={student.phone ?? "—"} />
                  <SideFact
                    label="Member Since"
                    value={formatDate(student.createdAt)}
                  />
                </SideFactRow>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <SideFactRow>
                  <SideFact
                    label="Ethnicity"
                    value={formatEthnicity(student.ethnicity) ?? "—"}
                  />
                  <SideFact
                    label="Religion"
                    value={
                      student.religion
                        ? RELIGION_LABELS[student.religion]
                        : "—"
                    }
                  />
                </SideFactRow>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/80 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <SideFactRow>
                <SideFact
                  label="Scholarship type"
                  value={
                    student.scholarshipType
                      ? SCHOLARSHIP_TYPE_LABELS[student.scholarshipType]
                      : "—"
                  }
                />
                <SideFact
                  label="Graduation year"
                  value={student.graduationYear ?? "—"}
                />
              </SideFactRow>
              <Separator />
              <SideFactRow>
                <SideFact
                  label="Year of study"
                  value={student.yearOfStudy ?? "—"}
                />
                <SideFact label="GPA" value={student.gpa ?? "—"} />
              </SideFactRow>
              <Separator />
              <SideFact
                label="Current semester"
                value={student.currentSemesterLabel ?? "—"}
              />
            </CardContent>
          </Card>

          {/* Banking Details */}
          <Card className="shadow-sm border-border/80 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                Banking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {hasBank ? (
                bankAccounts.filter((account) => hasAnyBankField(account)).map((account, index, visible) => (
                  <div key={account.id ?? index} className="space-y-4">
                    {visible.length > 1 ? (
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Account {index + 1}
                        </p>
                        {index === 0 ? (
                          <Badge variant="secondary">Primary</Badge>
                        ) : null}
                      </div>
                    ) : null}
                    <SideFactRow>
                      <SideFact
                        label="Bank Name"
                        value={account.bankName || "—"}
                      />
                      <SideFact
                        label="Account Holder"
                        value={account.bankAccountName || "—"}
                      />
                    </SideFactRow>
                    <Separator />
                    {account.bankAccountNumber ? (
                      <div className="bg-muted/30 p-3 rounded-md border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <p className="text-muted-foreground text-xs">
                            Account Number
                          </p>
                        </div>
                        <CopyField value={account.bankAccountNumber} label="Account number" />
                      </div>
                    ) : null}
                    {account.promptpayNumber ? (
                      <div className="bg-muted/30 p-3 rounded-md border border-border/50">
                        <p className="text-muted-foreground text-xs mb-1">
                          PromptPay
                        </p>
                        <CopyField value={account.promptpayNumber} label="PromptPay" />
                      </div>
                    ) : null}
                    {index < visible.length - 1 ? <Separator /> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  No bank details on file.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SideFactRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-3">
      {children}
    </div>
  );
}

function SideFact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
      <p className="wrap-break-word font-medium text-foreground [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}

function TimelineEvent({
  dotColor,
  dotInner,
  dateLabel,
  children,
}: {
  dotColor: string;
  dotInner: React.ReactNode;
  dateLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-8">
      <div
        className={`absolute -left-3.5 top-1 h-7 w-7 rounded-full border-4 flex items-center justify-center ${dotColor}`}
      >
        {dotInner}
      </div>
      <div className="mb-1 text-sm font-medium text-muted-foreground">
        {dateLabel}
      </div>
      {children}
    </div>
  );
}
