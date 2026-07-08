import { Lock, Pencil, CheckCircle2, X, ChevronRight, Camera } from "lucide-react";

const student = {
  firstName: "Somchai", lastName: "Jaidee",
  studentId: "STU-2024-0847", email: "somchai.jaidee@example.com",
  phone: "0810000000", university: "Chulalongkorn University",
  degreeProgram: "Computer Science", yearOfStudy: "3",
  currentSemester: "Fall 2026", gpa: "3.60",
  bankName: "Bangkok Bank", accountHolder: "Somchai Jaidee",
  accountNumber: "123-4-56789", promptpay: "0810000000",
};

function EditField({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div className="group relative space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type={type}
          defaultValue={value}
          className="h-10 w-full rounded-lg border border-border bg-card px-3 pr-8 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 group-hover:border-primary/40"
        />
        <Pencil className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/30 transition group-hover:text-primary/50 group-focus-within:hidden" />
      </div>
    </div>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <Lock className="size-3 text-muted-foreground/40" />
      </div>
      <div className="group relative flex h-10 cursor-not-allowed items-center rounded-lg border border-dashed border-border/50 bg-muted/30 px-3 text-sm text-muted-foreground/60">
        {value}
        <span className="absolute -top-7 left-0 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] text-background group-hover:block">
          This field cannot be changed
        </span>
      </div>
    </div>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div className="group space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 group-hover:border-primary/40">
        <option>{value}</option>
      </select>
    </div>
  );
}

function SectionPanel({ title, accent = false, children }: { title: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition ${accent ? "border-primary/30 ring-1 ring-primary/15" : "border-border/70"}`}>
      <div className={`flex items-center justify-between border-b px-6 py-4 ${accent ? "border-primary/20 bg-brand-fuchsia-light/30" : "border-border/40 bg-muted/15"}`}>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {accent && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
            <Pencil className="size-3" /> Editing
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function EditAffordances() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">My Profile</span>
          <ChevronRight className="size-3.5" />
          <span>Edit</span>
        </div>

        {/* Header with unsaved-changes indicator */}
        <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/8 px-5 py-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="size-2 animate-pulse rounded-full bg-accent" />
            <span className="font-medium text-foreground">Unsaved changes</span>
            <span className="text-muted-foreground">— edit fields below, then save</span>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
              <X className="size-3" /> Discard
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90">
              <CheckCircle2 className="size-3" /> Save all changes
            </button>
          </div>
        </div>

        {/* Photo */}
        <SectionPanel title="Profile photo">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">SJ</div>
              <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground shadow-md hover:scale-110 transition">
                <Camera className="size-3.5" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Click the camera icon to change your photo</p>
              <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, or WebP · Max 10 MB</p>
              <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                <Camera className="size-3" /> Choose file
                <input type="file" className="sr-only" accept="image/*" />
              </label>
            </div>
          </div>
        </SectionPanel>

        {/* Personal — accent (active) */}
        <SectionPanel title="Personal information" accent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
            <EditField label="First name" value={student.firstName} />
            <EditField label="Last name" value={student.lastName} />
            <LockedField label="Student ID" value={student.studentId} />
            <LockedField label="Email address" value={student.email} />
            <EditField label="Phone number" value={student.phone} type="tel" />
          </div>
        </SectionPanel>

        {/* Academic */}
        <SectionPanel title="Academic information">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
            <SelectField label="University" value={student.university} />
            <EditField label="Degree program" value={student.degreeProgram} />
            <EditField label="Year of study" value={student.yearOfStudy} />
            <SelectField label="Current semester" value={student.currentSemester} />
            <EditField label="GPA" value={student.gpa} type="number" />
          </div>
        </SectionPanel>

        {/* Bank */}
        <SectionPanel title="Bank information">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
            <EditField label="Bank name" value={student.bankName} />
            <EditField label="Account holder" value={student.accountHolder} />
            <EditField label="Account number" value={student.accountNumber} />
            <EditField label="PromptPay" value={student.promptpay} type="tel" />
          </div>
        </SectionPanel>

        {/* Sticky bottom bar */}
        <div className="sticky bottom-0 flex justify-end gap-3 rounded-xl border border-border/70 bg-card/95 p-4 shadow-lg backdrop-blur">
          <button className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
          <button className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground shadow-sm shadow-accent/30 hover:bg-accent/90">
            <CheckCircle2 className="size-4" /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
