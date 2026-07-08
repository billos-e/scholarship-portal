import { Lock, Camera, ChevronRight } from "lucide-react";

const student = {
  firstName: "Somchai", lastName: "Jaidee",
  studentId: "STU-2024-0847", email: "somchai.jaidee@example.com",
  phone: "0810000000", university: "Chulalongkorn University",
  degreeProgram: "Computer Science", yearOfStudy: "3",
  currentSemester: "Fall 2026", gpa: "3.60",
  bankName: "Bangkok Bank", accountHolder: "Somchai Jaidee",
  accountNumber: "123-4-56789", promptpay: "0810000000",
};

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
        <Lock className="size-3 text-muted-foreground/40" />
      </div>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 text-sm text-muted-foreground/70">
        {value}
      </div>
      <p className="text-[10px] text-muted-foreground/50">This field cannot be changed</p>
    </div>
  );
}

function EditableField({ label, value, hint, type = "text" }: { label: string; value: string; hint?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      {hint && <p className="text-[10px] text-muted-foreground/50">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <select className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
        <option>{value}</option>
      </select>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-center gap-4 border-b border-border/50 bg-muted/20 px-6 py-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          {n}
        </span>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function EditHierarchy() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Page header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">My Profile</span>
          <ChevronRight className="size-3.5" />
          <span>Edit</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Edit profile</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">4 sections · 14 fields</p>
          </div>
        </div>

        {/* Section 1 — Photo */}
        <Section n="01" title="Profile photo">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                SJ
              </div>
              <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground shadow">
                <Camera className="size-3.5" />
              </button>
            </div>
            <div className="flex-1 space-y-2">
              <input type="file" className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-xs file:font-medium" />
              <p className="text-xs text-muted-foreground">JPG, PNG, or WebP · Max 10 MB</p>
              <button className="rounded-lg border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">Upload photo</button>
            </div>
          </div>
        </Section>

        {/* Section 2 — Personal */}
        <Section n="02" title="Personal information">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
            <EditableField label="First name" value={student.firstName} />
            <EditableField label="Last name" value={student.lastName} />
            <LockedField label="Student ID" value={student.studentId} />
            <LockedField label="Email address" value={student.email} />
            <EditableField label="Phone number" value={student.phone} type="tel" />
          </div>
        </Section>

        {/* Section 3 — Academic */}
        <Section n="03" title="Academic information">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
            <SelectField label="University" value={student.university} />
            <EditableField label="Degree program" value={student.degreeProgram} />
            <EditableField label="Year of study" value={student.yearOfStudy} hint="Enter a number (e.g. 3)" />
            <SelectField label="Current semester" value={student.currentSemester} />
            <EditableField label="GPA" value={student.gpa} hint="0.00 – 4.00" type="number" />
          </div>
        </Section>

        {/* Section 4 — Bank */}
        <Section n="04" title="Bank information">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
            <EditableField label="Bank name" value={student.bankName} />
            <EditableField label="Account holder" value={student.accountHolder} />
            <EditableField label="Account number" value={student.accountNumber} />
            <EditableField label="PromptPay" value={student.promptpay} type="tel" />
          </div>
        </Section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-4">
          <button className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
          <button className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90">Save changes</button>
        </div>
      </div>
    </div>
  );
}
