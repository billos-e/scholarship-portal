import { useState } from "react";
import { Lock, ChevronDown, ChevronRight, Check, Camera } from "lucide-react";

const student = {
  firstName: "Somchai", lastName: "Jaidee",
  studentId: "STU-2024-0847", email: "somchai.jaidee@example.com",
  phone: "0810000000", university: "Chulalongkorn University",
  degreeProgram: "Computer Science", yearOfStudy: "3",
  currentSemester: "Fall 2026", gpa: "3.60",
  bankName: "Bangkok Bank", accountHolder: "Somchai Jaidee",
  accountNumber: "123-4-56789", promptpay: "0810000000",
};

function F({ label, value, type = "text", locked }: { label: string; value: string; type?: string; locked?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {locked && <Lock className="size-2.5 text-muted-foreground/40" />}
      </div>
      {locked ? (
        <div className="flex h-9 items-center rounded-lg border border-dashed border-border/50 bg-muted/30 px-3 text-sm text-muted-foreground/60">{value}</div>
      ) : (
        <input type={type} defaultValue={value} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
      )}
    </div>
  );
}

function Sel({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
        <option>{value}</option>
      </select>
    </div>
  );
}

type AccordionSection = {
  id: number;
  title: string;
  summary: string;
  done: boolean;
  children: React.ReactNode;
};

function Accordion({ sections }: { sections: AccordionSection[] }) {
  const [open, setOpen] = useState(1);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm divide-y divide-border/50">
      {sections.map((s) => (
        <div key={s.id}>
          <button
            onClick={() => setOpen(open === s.id ? -1 : s.id)}
            className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-muted/30"
          >
            <div className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${s.done ? "bg-success text-white" : open === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {s.done ? <Check className="size-3.5" /> : s.id}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground truncate">{s.summary}</p>
            </div>
            {open === s.id ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
          </button>
          {open === s.id && (
            <div className="border-t border-border/40 bg-muted/10 px-6 py-5">
              {s.children}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function EditStepped() {
  const sections: AccordionSection[] = [
    {
      id: 1,
      title: "Profile photo",
      summary: "Current photo: initials SJ",
      done: false,
      children: (
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">SJ</div>
            <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground shadow"><Camera className="size-3.5" /></button>
          </div>
          <div className="space-y-2">
            <input type="file" accept="image/*" className="block text-xs text-muted-foreground file:mr-2 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-1 file:text-xs file:font-medium" />
            <p className="text-xs text-muted-foreground">JPG, PNG, or WebP · Max 10 MB</p>
            <button className="rounded-lg border border-border bg-card px-4 py-1.5 text-xs font-semibold hover:bg-muted">Upload photo</button>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Personal information",
      summary: `${student.firstName} ${student.lastName} · ${student.phone}`,
      done: false,
      children: (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
          <F label="First name" value={student.firstName} />
          <F label="Last name" value={student.lastName} />
          <F label="Student ID" value={student.studentId} locked />
          <F label="Email address" value={student.email} locked />
          <F label="Phone number" value={student.phone} type="tel" />
        </div>
      ),
    },
    {
      id: 3,
      title: "Academic information",
      summary: `${student.degreeProgram} · Year ${student.yearOfStudy} · GPA ${student.gpa}`,
      done: true,
      children: (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
          <div className="col-span-2 lg:col-span-1"><Sel label="University" value={student.university} /></div>
          <F label="Degree program" value={student.degreeProgram} />
          <F label="Year of study" value={student.yearOfStudy} />
          <Sel label="Current semester" value={student.currentSemester} />
          <F label="GPA" value={student.gpa} type="number" />
        </div>
      ),
    },
    {
      id: 4,
      title: "Bank information",
      summary: `${student.bankName} · ${student.accountNumber}`,
      done: true,
      children: (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
          <F label="Bank name" value={student.bankName} />
          <F label="Account holder" value={student.accountHolder} />
          <F label="Account number" value={student.accountNumber} />
          <F label="PromptPay" value={student.promptpay} type="tel" />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">My Profile</span>
              <ChevronRight className="size-3.5" />
              <span>Edit</span>
            </div>
            <h1 className="mt-1 font-heading text-2xl font-bold text-foreground">Edit profile</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Progress</p>
            <p className="text-sm font-bold text-foreground">2 / 4 complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-border/50">
          <div className="h-full w-1/2 rounded-full bg-primary transition-all" />
        </div>

        {/* Accordion */}
        <Accordion sections={sections} />

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-4">
          <button className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
          <button className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90">Save changes</button>
        </div>
      </div>
    </div>
  );
}
