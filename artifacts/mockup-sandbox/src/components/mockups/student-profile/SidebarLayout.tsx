import { GraduationCap, Mail, Phone, Building2, BookOpen, Calendar, CreditCard, Landmark, Pencil, BadgeCheck } from "lucide-react";

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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

export function SidebarLayout() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto flex max-w-5xl gap-6">

        {/* ── Left sidebar ── */}
        <aside className="flex w-56 shrink-0 flex-col gap-4">
          {/* Avatar card */}
          <div className="rounded-xl border border-border/70 bg-card p-5 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              SJ
            </div>
            <p className="mt-3 font-heading text-base font-semibold text-foreground">
              {student.firstName} {student.lastName}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[11px] font-semibold text-success">
              <BadgeCheck className="size-3" /> {student.status}
            </span>
            <p className="mt-2 text-[11px] text-muted-foreground">{student.studentId}</p>
            <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90">
              <Pencil className="size-3" /> Edit profile
            </button>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border border-border/70 bg-card divide-y divide-border/50">
            {[
              { icon: GraduationCap, label: "GPA", value: student.gpa },
              { icon: BookOpen, label: "Year", value: `Year ${student.yearOfStudy}` },
              { icon: Calendar, label: "Semester", value: student.currentSemester },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-fuchsia-light text-primary">
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="truncate text-xs font-semibold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-border/70 bg-card divide-y divide-border/50">
            {[
              { icon: Mail, value: student.email },
              { icon: Phone, value: student.phone },
            ].map(({ icon: Icon, value }) => (
              <div key={value} className="flex items-start gap-2.5 px-4 py-3">
                <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <p className="break-all text-[11px] text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col gap-4">
          <Section title="Academic information">
            <Field label="University" value={student.university} />
            <Field label="Degree program" value={student.degreeProgram} />
            <Field label="Year of study" value={`Year ${student.yearOfStudy}`} />
            <Field label="Current semester" value={student.currentSemester} />
            <Field label="GPA" value={student.gpa} />
            <Field label="Member since" value={student.memberSince} />
          </Section>

          <Section title="Personal information">
            <Field label="First name" value={student.firstName} />
            <Field label="Last name" value={student.lastName} />
            <Field label="Student ID" value={student.studentId} />
            <Field label="Phone number" value={student.phone} />
            <div className="col-span-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Email address</p>
              <a href={`mailto:${student.email}`} className="mt-0.5 text-sm font-medium text-primary hover:underline">{student.email}</a>
            </div>
          </Section>

          <Section title="Bank information">
            <Field label="Bank name" value={student.bankName} />
            <Field label="Account holder" value={student.accountHolder} />
            <Field label="Account number" value={student.accountNumber} />
            <Field label="PromptPay" value={student.promptpay} />
          </Section>
        </div>
      </div>
    </div>
  );
}
