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

function F({ label, value, type = "text", locked, wide }: { label: string; value: string; type?: string; locked?: boolean; wide?: boolean }) {
  return (
    <div className={`space-y-1.5 ${wide ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {locked && <Lock className="size-2.5 text-muted-foreground/40" />}
      </div>
      {locked ? (
        <div className="flex h-9 w-full items-center rounded-lg border border-dashed border-border/50 bg-muted/30 px-3 text-sm text-muted-foreground/70">{value}</div>
      ) : (
        <input type={type} defaultValue={value} className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
      )}
    </div>
  );
}

function Sel({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`space-y-1.5 ${wide ? "col-span-2" : ""}`}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
        <option>{value}</option>
      </select>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">{children}</div>
      <div className="border-t border-border/40" />
    </div>
  );
}

export function EditSplitPanel() {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* ── Fixed left sidebar ── */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-border/70 bg-card">
        <div className="flex items-center gap-1.5 border-b border-border/40 px-5 py-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">My Profile</span>
          <ChevronRight className="size-3" />
          <span>Edit</span>
        </div>

        <div className="flex flex-col items-center px-6 py-8 text-center">
          <div className="relative">
            <div className="flex size-24 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">SJ</div>
            <button className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground shadow-md transition hover:scale-110">
              <Camera className="size-3.5" />
            </button>
          </div>
          <p className="mt-4 font-heading text-lg font-bold text-foreground">{student.firstName} {student.lastName}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{student.studentId}</p>
          <span className="mt-2 rounded-full bg-success-light px-2.5 py-0.5 text-[11px] font-semibold text-success">Active</span>
        </div>

        <div className="mx-4 mb-4 space-y-2.5 rounded-xl border border-border/60 bg-muted/30 p-4">
          <p className="text-xs font-semibold text-foreground">Profile photo</p>
          <input type="file" className="block w-full text-[11px] text-muted-foreground file:mr-2 file:rounded-md file:border file:border-border file:bg-card file:px-2 file:py-1 file:text-[11px] file:font-medium" />
          <p className="text-[10px] text-muted-foreground">JPG, PNG, or WebP · Max 10 MB</p>
          <button className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">Upload photo</button>
        </div>

        <nav className="mt-auto border-t border-border/40 p-3 space-y-1">
          {[
            { label: "Personal information", active: true },
            { label: "Academic information", active: false },
            { label: "Bank information", active: false },
          ].map(({ label, active }) => (
            <div key={label} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium ${active ? "bg-primary/8 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
              <span>{label}</span>
              {active && <div className="size-1.5 rounded-full bg-primary" />}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Scrollable right content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border/50 bg-card px-8 py-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">Edit profile</h1>
            <p className="text-xs text-muted-foreground">Changes are saved when you click Save changes</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
            <button className="rounded-xl bg-accent px-6 py-2 text-sm font-bold text-accent-foreground hover:bg-accent/90">Save changes</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
          <Block title="Personal information">
            <F label="First name" value={student.firstName} />
            <F label="Last name" value={student.lastName} />
            <F label="Student ID" value={student.studentId} locked />
            <F label="Email address" value={student.email} locked wide />
            <F label="Phone number" value={student.phone} type="tel" />
          </Block>

          <Block title="Academic information">
            <Sel label="University" value={student.university} wide />
            <Sel label="Degree program" value={student.degreeProgram} />
            <F label="Year of study" value={student.yearOfStudy} />
            <Sel label="Current semester" value={student.currentSemester} />
            <F label="GPA" value={student.gpa} type="number" />
          </Block>

          <Block title="Bank information">
            <F label="Bank name" value={student.bankName} />
            <F label="Account holder" value={student.accountHolder} />
            <F label="Account number" value={student.accountNumber} />
            <F label="PromptPay" value={student.promptpay} type="tel" />
          </Block>
        </div>
      </div>
    </div>
  );
}
