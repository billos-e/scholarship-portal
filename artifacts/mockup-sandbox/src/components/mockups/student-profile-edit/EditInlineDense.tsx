import { Lock, ChevronRight, Camera } from "lucide-react";

const student = {
  firstName: "Somchai", lastName: "Jaidee",
  studentId: "STU-2024-0847", email: "somchai.jaidee@example.com",
  phone: "0810000000", university: "Chulalongkorn University",
  degreeProgram: "Computer Science", yearOfStudy: "3",
  currentSemester: "Fall 2026", gpa: "3.60",
  bankName: "Bangkok Bank", accountHolder: "Somchai Jaidee",
  accountNumber: "123-4-56789", promptpay: "0810000000",
};

function Row({ label, children, locked }: { label: string; children: React.ReactNode; locked?: boolean }) {
  return (
    <div className={`flex items-center gap-6 border-b border-border/30 py-3 last:border-0 ${locked ? "opacity-60" : ""}`}>
      <div className="flex w-36 shrink-0 items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {locked && <Lock className="size-2.5 text-muted-foreground/50" />}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function TextInput({ value, type = "text" }: { value: string; type?: string }) {
  return (
    <input
      type={type}
      defaultValue={value}
      className="h-8 w-full max-w-sm rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
    />
  );
}

function LockedValue({ value }: { value: string }) {
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

function SelectInput({ value }: { value: string }) {
  return (
    <select className="h-8 w-full max-w-sm rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
      <option>{value}</option>
    </select>
  );
}

function PairRow({ label1, value1, label2, value2, type1 = "text", type2 = "text" }: { label1: string; value1: string; label2: string; value2: string; type1?: string; type2?: string }) {
  return (
    <div className="flex items-center gap-6 border-b border-border/30 py-3 last:border-0">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex w-36 shrink-0 items-center">
          <span className="text-xs font-medium text-muted-foreground">{label1}</span>
        </div>
        <input type={type1} defaultValue={value1} className="h-8 flex-1 rounded-md border border-border bg-card px-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
      </div>
      <div className="flex flex-1 items-center gap-4">
        <div className="flex w-28 shrink-0 items-center">
          <span className="text-xs font-medium text-muted-foreground">{label2}</span>
        </div>
        <input type={type2} defaultValue={value2} className="h-8 flex-1 rounded-md border border-border bg-card px-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{title}</p>
      <div className="rounded-xl border border-border/60 bg-card px-5 shadow-sm">{children}</div>
    </div>
  );
}

export function EditInlineDense() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">My Profile</span>
              <ChevronRight className="size-3" />
              <span>Edit</span>
            </div>
            <h1 className="mt-1 font-heading text-2xl font-bold text-foreground">Edit profile</h1>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
            <button className="rounded-xl bg-accent px-5 py-2 text-sm font-bold text-accent-foreground hover:bg-accent/90">Save changes</button>
          </div>
        </div>

        {/* Photo — inline row style */}
        <Group title="Photo">
          <div className="flex items-center gap-5 py-3">
            <div className="relative shrink-0">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">SJ</div>
              <button className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border border-card bg-accent text-accent-foreground shadow">
                <Camera className="size-2.5" />
              </button>
            </div>
            <div className="flex flex-1 items-center gap-4">
              <input type="file" accept="image/*" className="flex-1 text-xs text-muted-foreground file:mr-2 file:rounded-md file:border file:border-border file:bg-muted file:px-2.5 file:py-1 file:text-xs file:font-medium" />
              <button className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">Upload</button>
            </div>
          </div>
        </Group>

        {/* Personal — inline rows */}
        <Group title="Personal information">
          <PairRow label1="First name" value1={student.firstName} label2="Last name" value2={student.lastName} />
          <Row label="Student ID" locked>
            <LockedValue value={student.studentId} />
          </Row>
          <Row label="Email address" locked>
            <LockedValue value={student.email} />
          </Row>
          <Row label="Phone number">
            <TextInput value={student.phone} type="tel" />
          </Row>
        </Group>

        {/* Academic — inline rows */}
        <Group title="Academic information">
          <Row label="University">
            <SelectInput value={student.university} />
          </Row>
          <PairRow label1="Degree program" value1={student.degreeProgram} label2="Year of study" value2={student.yearOfStudy} />
          <div className="flex items-center gap-6 border-b border-border/30 py-3 last:border-0">
            <div className="flex flex-1 items-center gap-4">
              <div className="w-36 shrink-0 text-xs font-medium text-muted-foreground">Current semester</div>
              <div className="flex-1">
                <SelectInput value={student.currentSemester} />
              </div>
            </div>
            <div className="flex flex-1 items-center gap-4">
              <div className="w-28 shrink-0 text-xs font-medium text-muted-foreground">GPA</div>
              <input type="number" defaultValue={student.gpa} step="0.01" className="h-8 flex-1 rounded-md border border-border bg-card px-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
          </div>
        </Group>

        {/* Bank — inline rows */}
        <Group title="Bank information">
          <PairRow label1="Bank name" value1={student.bankName} label2="Account holder" value2={student.accountHolder} />
          <PairRow label1="Account number" value1={student.accountNumber} label2="PromptPay" value2={student.promptpay} type2="tel" />
        </Group>
      </div>
    </div>
  );
}
