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

const COL_W = "w-44 shrink-0";

function Row({ label, children, locked }: { label: string; children: React.ReactNode; locked?: boolean }) {
  return (
    <div className={`flex items-center gap-5 border-b border-border/30 py-3 last:border-0 ${locked ? "opacity-60" : ""}`}>
      <div className={`${COL_W} flex items-center gap-1.5`}>
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
      className="h-8 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
    />
  );
}

function LockedVal({ value }: { value: string }) {
  return (
    <div className="flex h-8 items-center rounded-md border border-dashed border-border/50 bg-muted/30 px-2.5 text-sm text-muted-foreground">{value}</div>
  );
}

function SelInput({ value }: { value: string }) {
  return (
    <select className="h-8 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
      <option>{value}</option>
    </select>
  );
}

function PairRow({ label1, children1, label2, children2 }: { label1: string; children1: React.ReactNode; label2: string; children2: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0 border-b border-border/30 py-3 last:border-0">
      <div className="flex flex-1 items-center gap-5">
        <div className={`${COL_W} text-xs font-medium text-muted-foreground`}>{label1}</div>
        <div className="flex-1 min-w-0">{children1}</div>
      </div>
      <div className="mx-4 h-6 w-px shrink-0 bg-border/40" />
      <div className="flex flex-1 items-center gap-5">
        <div className="w-36 shrink-0 text-xs font-medium text-muted-foreground">{label2}</div>
        <div className="flex-1 min-w-0">{children2}</div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{title}</p>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card px-6 shadow-sm">{children}</div>
    </div>
  );
}

export function EditInlineDense() {
  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
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
            <button className="rounded-xl border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
            <button className="rounded-xl bg-accent px-6 py-2 text-sm font-bold text-accent-foreground hover:bg-accent/90">Save changes</button>
          </div>
        </div>

        {/* Photo — inline row style */}
        <Group title="Photo">
          <div className="flex items-center gap-6 py-4">
            <div className="relative shrink-0">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">SJ</div>
              <button className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full border border-card bg-accent text-accent-foreground shadow">
                <Camera className="size-3" />
              </button>
            </div>
            <div className="flex flex-1 items-center gap-4">
              <input type="file" accept="image/*" className="flex-1 min-w-0 text-xs text-muted-foreground file:mr-2 file:rounded-md file:border file:border-border file:bg-muted file:px-2.5 file:py-1 file:text-xs file:font-medium" />
              <p className="shrink-0 text-xs text-muted-foreground">JPG, PNG, WebP · Max 10 MB</p>
              <button className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">Upload</button>
            </div>
          </div>
        </Group>

        {/* Personal */}
        <Group title="Personal information">
          <PairRow
            label1="First name" children1={<TextInput value={student.firstName} />}
            label2="Last name" children2={<TextInput value={student.lastName} />}
          />
          <Row label="Student ID" locked>
            <LockedVal value={student.studentId} />
          </Row>
          <Row label="Email address" locked>
            <LockedVal value={student.email} />
          </Row>
          <Row label="Phone number">
            <TextInput value={student.phone} type="tel" />
          </Row>
        </Group>

        {/* Academic */}
        <Group title="Academic information">
          <Row label="University">
            <SelInput value={student.university} />
          </Row>
          <PairRow
            label1="Degree program" children1={<SelInput value={student.degreeProgram} />}
            label2="Year of study" children2={<TextInput value={student.yearOfStudy} />}
          />
          <PairRow
            label1="Current semester" children1={<SelInput value={student.currentSemester} />}
            label2="GPA" children2={<input type="number" defaultValue={student.gpa} step="0.01" className="h-8 w-full rounded-md border border-border bg-card px-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />}
          />
        </Group>

        {/* Bank */}
        <Group title="Bank information">
          <PairRow
            label1="Bank name" children1={<TextInput value={student.bankName} />}
            label2="Account holder" children2={<TextInput value={student.accountHolder} />}
          />
          <PairRow
            label1="Account number" children1={<TextInput value={student.accountNumber} />}
            label2="PromptPay" children2={<TextInput value={student.promptpay} type="tel" />}
          />
        </Group>
      </div>
    </div>
  );
}
