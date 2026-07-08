import { GraduationCap, Mail, Phone, BookOpen, Calendar, Building2, Landmark, CreditCard, BadgeCheck, Pencil, User, Hash } from "lucide-react";

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

function Tile({ icon: Icon, label, value, tone = "default" }: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "primary" | "accent" | "info" | "success" | "default";
}) {
  const toneClasses = {
    primary: "bg-brand-fuchsia-light text-primary",
    accent: "bg-brand-orange-light text-accent",
    info: "bg-info-light text-info",
    success: "bg-success-light text-success",
    default: "bg-muted text-muted-foreground",
  };
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {children}
    </p>
  );
}

export function DashboardTiles() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* ── Header bar ── */}
        <div className="flex items-center gap-5 rounded-2xl border border-border/70 bg-card px-6 py-5 shadow-sm">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm shadow-primary/20">
            SJ
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold text-foreground">
                {student.firstName} {student.lastName}
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[11px] font-semibold text-success">
                <BadgeCheck className="size-3" /> {student.status}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {student.university} · {student.degreeProgram}
            </p>
          </div>
          <button className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
            <Pencil className="size-3.5" /> Edit profile
          </button>
        </div>

        {/* ── Academic tiles ── */}
        <div>
          <SectionLabel>Academic</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Tile icon={GraduationCap} label="GPA" value={student.gpa} tone="primary" />
            <Tile icon={BookOpen} label="Degree program" value={student.degreeProgram} tone="primary" />
            <Tile icon={Building2} label="University" value={student.university} tone="primary" />
            <Tile icon={Calendar} label="Current semester" value={student.currentSemester} tone="primary" />
            <Tile icon={Hash} label="Year of study" value={`Year ${student.yearOfStudy}`} tone="primary" />
            <Tile icon={Calendar} label="Member since" value={student.memberSince} tone="default" />
          </div>
        </div>

        {/* ── Contact tiles ── */}
        <div>
          <SectionLabel>Contact</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Tile icon={User} label="First name" value={student.firstName} tone="accent" />
            <Tile icon={User} label="Last name" value={student.lastName} tone="accent" />
            <Tile icon={Hash} label="Student ID" value={student.studentId} tone="accent" />
            <Tile icon={Mail} label="Email address" value={student.email} tone="accent" />
            <Tile icon={Phone} label="Phone number" value={student.phone} tone="accent" />
          </div>
        </div>

        {/* ── Bank tiles ── */}
        <div>
          <SectionLabel>Bank information</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Tile icon={Landmark} label="Bank name" value={student.bankName} tone="info" />
            <Tile icon={User} label="Account holder" value={student.accountHolder} tone="info" />
            <Tile icon={CreditCard} label="Account number" value={student.accountNumber} tone="info" />
            <Tile icon={Phone} label="PromptPay" value={student.promptpay} tone="info" />
          </div>
        </div>
      </div>
    </div>
  );
}
