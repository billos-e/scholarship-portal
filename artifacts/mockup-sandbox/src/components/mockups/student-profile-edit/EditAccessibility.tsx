import { Lock, ChevronRight } from "lucide-react";

const student = {
  firstName: "Somchai", lastName: "Jaidee",
  studentId: "STU-2024-0847", email: "somchai.jaidee@example.com",
  phone: "0810000000", university: "Chulalongkorn University",
  degreeProgram: "Computer Science", yearOfStudy: "3",
  currentSemester: "Fall 2026", gpa: "3.60",
  bankName: "Bangkok Bank", accountHolder: "Somchai Jaidee",
  accountNumber: "123-4-56789", promptpay: "0810000000",
};

function Field({
  label, htmlFor, value, hint, required, type = "text"
}: {
  label: string; htmlFor: string; value: string; hint?: string; required?: boolean; type?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="flex items-baseline gap-1.5 text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-xs font-normal text-destructive" aria-hidden>Required</span>}
      </label>
      <input
        id={htmlFor}
        name={htmlFor}
        type={type}
        defaultValue={value}
        required={required}
        aria-describedby={hint ? `${htmlFor}-hint` : undefined}
        className="h-12 w-full rounded-xl border-2 border-border bg-card px-4 text-base text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/12"
      />
      {hint && <p id={`${htmlFor}-hint`} className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

function LockedField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          <Lock className="size-3" /> Locked
        </span>
      </div>
      <div className="flex h-12 items-center rounded-xl border-2 border-border/50 bg-muted/40 px-4 text-base text-muted-foreground">
        {value}
      </div>
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SelectField({ label, htmlFor, value, hint }: { label: string; htmlFor: string; value: string; hint?: string }) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">{label}</label>
      <select
        id={htmlFor}
        name={htmlFor}
        aria-describedby={hint ? `${htmlFor}-hint` : undefined}
        className="h-12 w-full rounded-xl border-2 border-border bg-card px-4 text-base text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/12"
      >
        <option>{value}</option>
      </select>
      {hint && <p id={`${htmlFor}-hint`} className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <fieldset className="overflow-hidden rounded-2xl border-2 border-border/60 bg-card shadow-sm">
      <legend className="sr-only">{title}</legend>
      <div className="border-b-2 border-border/30 bg-muted/10 px-6 py-5">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function EditAccessibility() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><a href="#" className="font-medium text-foreground hover:underline">My Profile</a></li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li aria-current="page">Edit</li>
          </ol>
        </nav>

        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Edit profile</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Fields marked <span className="font-semibold text-destructive">Required</span> must be filled in. Locked fields are managed by your institution.
          </p>
        </div>

        {/* Photo */}
        <section aria-label="Profile photo" className="overflow-hidden rounded-2xl border-2 border-border/60 bg-card shadow-sm">
          <div className="border-b-2 border-border/30 bg-muted/10 px-6 py-5">
            <h2 className="text-base font-bold text-foreground">Profile photo</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Your photo helps scholarship reviewers identify you.</p>
          </div>
          <div className="flex items-center gap-6 p-6">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground" role="img" aria-label="Current profile photo: initials SJ">
              SJ
            </div>
            <div className="flex-1 space-y-2.5">
              <div>
                <label htmlFor="photo" className="text-sm font-semibold text-foreground">Choose a new photo</label>
                <p className="mt-0.5 text-xs text-muted-foreground">Accepted formats: JPG, PNG, WebP · Maximum size: 10 MB</p>
              </div>
              <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp"
                aria-describedby="photo-hint"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-4 file:py-2 file:text-sm file:font-semibold focus:outline-none" />
              <button type="button" className="rounded-xl border-2 border-border bg-card px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/12">
                Upload photo
              </button>
            </div>
          </div>
        </section>

        {/* Personal */}
        <Section title="Personal information" description="Your name and contact details.">
          <Field label="First name" htmlFor="firstName" value={student.firstName} required />
          <Field label="Last name" htmlFor="lastName" value={student.lastName} required />
          <LockedField label="Student ID" value={student.studentId} hint="Assigned by your institution — contact admin to update." />
          <LockedField label="Email address" value={student.email} hint="Tied to your login account — cannot be changed here." />
          <Field label="Phone number" htmlFor="phone" value={student.phone} type="tel" hint="Include country code if international (e.g. +66 8X XXXX XXXX)." />
        </Section>

        {/* Academic */}
        <Section title="Academic information" description="Details about your degree and current semester.">
          <SelectField label="University" htmlFor="university" value={student.university} hint="Select your enrolled institution." />
          <Field label="Degree program" htmlFor="degreeProgram" value={student.degreeProgram} hint="E.g. Computer Science, Engineering." />
          <Field label="Year of study" htmlFor="yearOfStudy" value={student.yearOfStudy} type="number" hint="Enter your current year (1–6)." />
          <SelectField label="Current semester" htmlFor="currentSemester" value={student.currentSemester} hint="The semester you are currently enrolled in." />
          <Field label="GPA" htmlFor="gpa" value={student.gpa} type="number" hint="Your cumulative GPA on a 4.00 scale." />
        </Section>

        {/* Bank */}
        <Section title="Bank information" description="Used for scholarship disbursements. Keep this accurate.">
          <Field label="Bank name" htmlFor="bankName" value={student.bankName} hint="E.g. Bangkok Bank, Kasikorn Bank." />
          <Field label="Account holder name" htmlFor="accountHolder" value={student.accountHolder} hint="Must match the name on your bank account." />
          <Field label="Account number" htmlFor="accountNumber" value={student.accountNumber} hint="Enter digits only, no dashes." />
          <Field label="PromptPay number" htmlFor="promptpay" value={student.promptpay} type="tel" hint="Your 10-digit mobile number registered with PromptPay." />
        </Section>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:justify-end">
          <button type="button" className="rounded-xl border-2 border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/12">
            Cancel
          </button>
          <button type="submit" className="rounded-xl bg-accent px-8 py-3 text-sm font-bold text-accent-foreground hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/25">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
