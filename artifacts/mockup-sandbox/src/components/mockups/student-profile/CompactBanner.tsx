import { Pencil, BadgeCheck, GraduationCap, BookOpen, Calendar, Building2, Mail, Phone, Landmark, CreditCard } from "lucide-react";

const student = {
  firstName: "Somchai",
  lastName: "Jaidee",
  studentId: "STU-2024-0847",
  email: "somchai.jaidee@example.com",
  phone: "0810000000",
  university: "Chulalongkorn University",
  degreeProgram: "Computer Science",
  yearOfStudy: "3",
  currentSemester: "Fall 2026",
  gpa: "3.60",
  memberSince: "Jul 3, 2026",
  status: "Active",
  bankName: "Bangkok Bank",
  accountHolder: "Somchai Jaidee",
  accountNumber: "123-4-56789",
  promptpay: "0810000000",
};

function Row({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children ?? <span className="text-sm font-medium text-foreground">{value ?? "—"}</span>}
    </div>
  );
}

function InfoBlock({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center gap-2.5 border-b border-border/50 bg-muted/20 px-5 py-3.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-brand-fuchsia-light text-primary">
          <Icon className="size-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

export function CompactBanner() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Full-width banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-brand-fuchsia px-8 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-3xl items-center gap-6">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-2xl font-bold text-white backdrop-blur-sm">
            SJ
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-2xl font-bold text-white">
                {student.firstName} {student.lastName}
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                <BadgeCheck className="size-3" /> {student.status}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
              <span>{student.studentId}</span>
              <span className="h-3 w-px bg-white/30" />
              <span>{student.degreeProgram}</span>
              <span className="h-3 w-px bg-white/30" />
              <span>Year {student.yearOfStudy}</span>
              <span className="h-3 w-px bg-white/30" />
              <span>{student.currentSemester}</span>
              <span className="h-3 w-px bg-white/30" />
              <span>GPA {student.gpa}</span>
            </div>
          </div>
          <button className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/25">
            <Pencil className="size-3.5" /> Edit profile
          </button>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <InfoBlock title="Personal information" icon={Mail}>
          <Row label="First name" value={student.firstName} />
          <Row label="Last name" value={student.lastName} />
          <Row label="Student ID" value={student.studentId} />
          <Row label="Email address">
            <a href={`mailto:${student.email}`} className="text-sm font-medium text-primary hover:underline">
              {student.email}
            </a>
          </Row>
          <Row label="Phone number" value={student.phone} />
          <Row label="Member since" value={student.memberSince} />
        </InfoBlock>

        <InfoBlock title="Academic information" icon={GraduationCap}>
          <Row label="University" value={student.university} />
          <Row label="Degree program" value={student.degreeProgram} />
          <Row label="Year of study" value={`Year ${student.yearOfStudy}`} />
          <Row label="Current semester" value={student.currentSemester} />
          <Row label="GPA" value={student.gpa} />
        </InfoBlock>

        <InfoBlock title="Bank information" icon={Landmark}>
          <Row label="Bank name" value={student.bankName} />
          <Row label="Account holder" value={student.accountHolder} />
          <Row label="Account number" value={student.accountNumber} />
          <Row label="PromptPay" value={student.promptpay} />
        </InfoBlock>
      </div>
    </div>
  );
}
