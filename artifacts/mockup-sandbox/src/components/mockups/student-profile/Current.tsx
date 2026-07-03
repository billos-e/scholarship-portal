import './_group.css';

import { Building2, MapPin, Pencil, Receipt } from "lucide-react";

/* ─── Helpers (inlined) ─── */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "THB", maximumFractionDigits: 2 }).format(num);
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ─── Static data ─── */
const student = {
  firstName: "Kanya",
  lastName: "Chai",
  studentId: "STU-2022-009",
  email: "kanya@student.example.com",
  phone: "+66 85 678 9012",
  status: "GRADUATED" as const,
  memberSince: "2020-06-01",
  photoUrl: null,
  universityId: "uni-chula",
  universityName: "Chulalongkorn University",
  degreeProgram: "Medicine",
  yearOfStudy: "5",
  currentSemesterLabel: "Spring 2025",
  gpa: "3.65",
  bankName: "Bangkok Bank",
  bankAccountName: "Kanya Chai",
  bankAccountNumber: "456-7-89012-3",
  promptpayNumber: "0856789012",
  paymentRequests: [
    {
      id: "req-1",
      semesterLabel: "Spring 2025",
      amountDue: "45000",
      submittedAt: "2025-01-15T08:30:00Z",
      status: "APPROVED" as const,
    },
  ],
};

/* ─── Sub-components (inlined) ─── */

function StudentStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Active", className: "border border-success/30 bg-success-light text-success" },
    GRADUATED: { label: "Graduated", className: "border border-success/30 bg-success-light text-success" },
    INACTIVE: { label: "Inactive", className: "border border-muted bg-muted text-muted-foreground" },
  };
  const c = configs[status] ?? { label: "Unknown", className: "border border-muted bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", c.className)}>
      {c.label}
    </span>
  );
}

function ProfileInfoField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-sans text-sm font-semibold text-foreground sm:text-[15px]">
        {children ?? (empty ? <span className="font-normal text-muted-foreground">—</span> : value)}
      </dd>
    </div>
  );
}

function ProfileInfoGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>;
}

function ProfileInfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <header className="flex flex-col gap-3 border-b border-border/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <h2 className="font-sans text-base font-semibold text-foreground sm:text-lg">{title}</h2>
      </header>
      <div className="px-4 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

function RequestSectionCard({
  title,
  description,
  icon: Icon,
  tone = "primary",
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  tone?: string;
  children: React.ReactNode;
}) {
  const toneClass: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    info: "bg-info-light text-info",
    success: "bg-success-light text-success",
    warning: "bg-accent/10 text-accent",
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="border-b border-border/50 bg-muted/20 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", toneClass[tone] ?? toneClass.primary)}>
            <Icon className="size-[18px]" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="font-sans text-base font-semibold text-foreground">{title}</h3>
            {description ? <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p> : null}
          </div>
        </div>
      </div>
      <div className="px-4 pt-4 sm:px-6 sm:pt-5">{children}</div>
    </div>
  );
}

function PaymentRequestsTable({ rows }: { rows: typeof student.paymentRequests }) {
  return (
    <>
      <div className="space-y-2 md:hidden">
        {rows.map((request) => (
          <div key={request.id} className="block rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{request.semesterLabel}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{formatCurrency(request.amountDue)}</p>
              </div>
              <span className="inline-flex items-center rounded-full border border-success/30 bg-success-light px-2 py-0.5 text-xs font-medium text-success">
                {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Submitted {formatDate(new Date(request.submittedAt))}</p>
          </div>
        ))}
      </div>
      <div className="hidden md:block">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Semester</th>
              <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Amount</th>
              <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Submitted</th>
              <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((request) => (
              <tr key={request.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-2 align-middle font-medium">{request.semesterLabel}</td>
                <td className="p-2 align-middle">{formatCurrency(request.amountDue)}</td>
                <td className="p-2 align-middle">{formatDate(new Date(request.submittedAt))}</td>
                <td className="p-2 align-middle">
                  <span className="inline-flex items-center rounded-full border border-success/30 bg-success-light px-2 py-0.5 text-xs font-medium text-success">
                    {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── Hero (inlined) ─── */
function StudentDetailHero({
  firstName,
  lastName,
  studentIdNumber,
  universityName,
  degreeProgram,
  yearOfStudy,
  currentSemesterLabel,
  gpa,
  status,
}: {
  firstName: string;
  lastName: string;
  studentIdNumber: string | null;
  universityName: string | null;
  degreeProgram: string | null;
  yearOfStudy: string | null;
  currentSemesterLabel: string | null;
  gpa: string | null;
  status: string;
}) {
  const fullName = `${firstName} ${lastName}`;
  const initials = getInitials(fullName);
  const summaryItems: { key: string; value: string; variant?: string }[] = [];
  if (studentIdNumber?.trim()) summaryItems.push({ key: "id", value: studentIdNumber.trim(), variant: "id" });
  if (degreeProgram?.trim()) summaryItems.push({ key: "degree", value: degreeProgram.trim() });
  if (yearOfStudy?.trim()) summaryItems.push({ key: "year", value: `Year ${yearOfStudy.trim()}` });
  if (currentSemesterLabel?.trim()) summaryItems.push({ key: "semester", value: currentSemesterLabel.trim() });
  if (gpa !== null && gpa !== undefined && String(gpa).trim()) summaryItems.push({ key: "gpa", value: `GPA ${String(gpa).trim()}` });

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card px-4 py-5 shadow-sm sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-3xl font-bold text-primary-foreground sm:size-28">
            {initials}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">{fullName}</h1>
              <StudentStatusBadge status={status} />
            </div>
            {summaryItems.length > 0 ? (
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                {summaryItems.map((item, index) => (
                  <span key={item.key} className="inline-flex items-center gap-2">
                    {index > 0 ? <span aria-hidden className="text-border">·</span> : null}
                    <span className={cn(item.variant === "id" && "font-mono font-medium text-primary")}>{item.value}</span>
                  </span>
                ))}
              </p>
            ) : null}
            {universityName ? (
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0 text-accent" />
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  {universityName}
                </span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground shadow-sm hover:bg-accent/90">
            <Pencil className="size-3.5" />
            Edit profile
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Breadcrumb ─── */
function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Students</span>
      <span>/</span>
      <span className="font-medium text-foreground">Kanya Chai</span>
    </nav>
  );
}

/* ─── Main page component ─── */
export function Current() {
  const fullName = `${student.firstName} ${student.lastName}`;
  const paymentCount = student.paymentRequests.length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Breadcrumb />

        <StudentDetailHero
          firstName={student.firstName}
          lastName={student.lastName}
          studentIdNumber={student.studentId}
          universityName={student.universityName}
          degreeProgram={student.degreeProgram}
          yearOfStudy={student.yearOfStudy}
          currentSemesterLabel={student.currentSemesterLabel}
          gpa={student.gpa}
          status={student.status}
        />

        <ProfileInfoCard title="Personal information">
          <ProfileInfoGrid>
            <ProfileInfoField label="First name" value={student.firstName} />
            <ProfileInfoField label="Last name" value={student.lastName} />
            <ProfileInfoField label="Student ID" value={student.studentId} />
            <ProfileInfoField label="Email address">
              <a href={`mailto:${student.email}`} className="text-primary underline-offset-4 transition-colors hover:underline">
                {student.email}
              </a>
            </ProfileInfoField>
            <ProfileInfoField label="Phone number" value={student.phone} />
            <ProfileInfoField label="Account status">
              <StudentStatusBadge status={student.status} />
            </ProfileInfoField>
            <ProfileInfoField label="Member since" value={formatDate(student.memberSince)} />
          </ProfileInfoGrid>
        </ProfileInfoCard>

        <ProfileInfoCard title="Academic information">
          <ProfileInfoGrid>
            <ProfileInfoField label="University" value={student.universityName} />
            <ProfileInfoField label="Degree program" value={student.degreeProgram} />
            <ProfileInfoField label="Year of study" value={student.yearOfStudy} />
            <ProfileInfoField label="Current semester" value={student.currentSemesterLabel} />
            <ProfileInfoField label="GPA" value={student.gpa} />
            <ProfileInfoField label="Payment requests" value={paymentCount === 0 ? "None" : `${paymentCount} on record`} />
          </ProfileInfoGrid>
        </ProfileInfoCard>

        <ProfileInfoCard title="Bank information">
          {student.bankName || student.bankAccountNumber ? (
            <ProfileInfoGrid>
              <ProfileInfoField label="Bank name" value={student.bankName} />
              <ProfileInfoField label="Account holder" value={student.bankAccountName} />
              <ProfileInfoField label="Account number" value={student.bankAccountNumber} />
              <ProfileInfoField label="PromptPay" value={student.promptpayNumber} />
            </ProfileInfoGrid>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">No bank details on file.</p>
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
            <p className="text-sm leading-relaxed text-muted-foreground">This student has not submitted any tuition payment requests yet.</p>
          ) : (
            <PaymentRequestsTable rows={student.paymentRequests} />
          )}
        </RequestSectionCard>
      </div>
    </div>
  );
}
