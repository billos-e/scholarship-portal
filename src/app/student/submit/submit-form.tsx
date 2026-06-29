"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  createSubmission,
  type SubmissionState,
} from "@/lib/actions/submissions";
import {
  ACTIVITY_OPTIONS,
  CHALLENGE_OPTIONS,
  SEMESTER_LABEL_SUGGESTIONS,
  WELLBEING_QUESTIONS,
} from "@/lib/submissions/constants";

type SemesterOption = { id: string; label: string };

type Defaults = {
  semesterLabel: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  promptpayNumber: string;
};

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b pb-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-w-[180px]">
      {pending ? "Submitting..." : "Submit semester"}
    </Button>
  );
}

function WellbeingRow({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Label htmlFor={name} className="text-sm">
        {label}
      </Label>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex items-center gap-1"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-input text-sm font-medium has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
          >
            <input
              type="radio"
              name={name}
              value={n}
              className="sr-only"
              aria-label={`${label}: ${n}`}
            />
            {n}
          </label>
        ))}
      </div>
    </div>
  );
}

export function SubmissionForm({
  defaults,
  semesters = [],
}: {
  defaults: Defaults;
  semesters?: SemesterOption[];
}) {
  const [state, formAction] = useActionState<SubmissionState, FormData>(
    createSubmission,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="space-y-10" encType="multipart/form-data">
      {/* ---------------- Semester ---------------- */}
      <section className="space-y-4">
        <SectionTitle
          title="Semester"
          description="Which semester this submission is for."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="semester">Semester *</Label>
            {semesters.length > 0 ? (
              <>
                <NativeSelect
                  id="semester"
                  name="universitySemesterId"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a semester
                  </option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </NativeSelect>
                <p className="text-xs text-muted-foreground">
                  Choose from your university&apos;s active semesters.
                </p>
              </>
            ) : (
              <>
                <Input
                  id="semesterLabel"
                  name="semesterLabel"
                  required
                  list="semester-suggestions"
                  defaultValue={defaults.semesterLabel}
                  placeholder="Fall 2026"
                />
                <datalist id="semester-suggestions">
                  {SEMESTER_LABEL_SUGGESTIONS.map((label) => (
                    <option key={label} value={label} />
                  ))}
                </datalist>
                <p className="text-xs text-muted-foreground">
                  No semesters configured for your university yet — enter the term
                  name manually, e.g. <em>Fall 2026</em>.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Tuition payment ---------------- */}
      <section className="space-y-4">
        <SectionTitle
          title="Tuition payment"
          description="Amount, due date and the official invoice from your university."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amountDue">Amount due (THB) *</Label>
            <Input
              id="amountDue"
              name="amountDue"
              type="number"
              required
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="25000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="invoiceFile">Invoice (PDF / JPG / PNG, max 10 MB)</Label>
            <Input
              id="invoiceFile"
              name="invoiceFile"
              type="file"
              accept="application/pdf,image/jpeg,image/png"
            />
          </div>
        </div>
      </section>

      {/* ---------------- Bank information ---------------- */}
      <section className="space-y-4">
        <SectionTitle
          title="Bank information"
          description="A snapshot is saved with this submission. Your profile's saved bank info is also updated."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bankAccountName">Account name</Label>
            <Input
              id="bankAccountName"
              name="bankAccountName"
              defaultValue={defaults.bankAccountName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber">Account number</Label>
            <Input
              id="bankAccountNumber"
              name="bankAccountNumber"
              defaultValue={defaults.bankAccountNumber}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank name</Label>
            <Input id="bankName" name="bankName" defaultValue={defaults.bankName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promptpayNumber">PromptPay number</Label>
            <Input
              id="promptpayNumber"
              name="promptpayNumber"
              defaultValue={defaults.promptpayNumber}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="qrFile">PromptPay QR image (JPG / PNG, optional)</Label>
            <Input
              id="qrFile"
              name="qrFile"
              type="file"
              accept="image/jpeg,image/png"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to keep the QR code already on your profile.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Academic ---------------- */}
      <section className="space-y-4">
        <SectionTitle
          title="Academic report"
          description="Your performance for this semester."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="gpa">GPA</Label>
            <Input
              id="gpa"
              name="gpa"
              type="number"
              min="0"
              max="4"
              step="0.01"
              inputMode="decimal"
              placeholder="3.50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditsCompleted">Credits completed</Label>
            <Input
              id="creditsCompleted"
              name="creditsCompleted"
              type="number"
              min="0"
              max="60"
              step="1"
              inputMode="numeric"
              placeholder="18"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passedAllCourses">Passed all courses?</Label>
            <NativeSelect
              id="passedAllCourses"
              name="passedAllCourses"
              defaultValue=""
            >
              <option value="">— Select —</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </NativeSelect>
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="transcriptFile">
              Transcript (PDF / JPG / PNG, max 10 MB)
            </Label>
            <Input
              id="transcriptFile"
              name="transcriptFile"
              type="file"
              accept="application/pdf,image/jpeg,image/png"
            />
          </div>
        </div>
      </section>

      {/* ---------------- Wellbeing ---------------- */}
      <section className="space-y-4">
        <SectionTitle
          title="Wellbeing"
          description="Rate each area from 1 (low) to 5 (high)."
        />
        <div className="space-y-4">
          {WELLBEING_QUESTIONS.map((q) => (
            <WellbeingRow key={q.name} name={q.name} label={q.label} />
          ))}
        </div>
      </section>

      {/* ---------------- Challenges ---------------- */}
      <section className="space-y-4">
        <SectionTitle
          title="Challenges"
          description="Select any that apply this semester."
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {CHALLENGE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-input p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                name="challenges"
                value={opt.value}
                className="size-4 accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      {/* ---------------- Activities ---------------- */}
      <section className="space-y-4">
        <SectionTitle
          title="Activities"
          description="Select any that apply this semester."
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {ACTIVITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-input p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                name="activities"
                value={opt.value}
                className="size-4 accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      {/* ---------------- Reflections ---------------- */}
      <section className="space-y-4">
        <SectionTitle
          title="Reflections"
          description="A few open-ended questions to help us support you."
        />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reflectionAchievement">
              Your biggest achievement this semester
            </Label>
            <Textarea
              id="reflectionAchievement"
              name="reflectionAchievement"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reflectionChallenge">
              Your biggest challenge and how you faced it
            </Label>
            <Textarea
              id="reflectionChallenge"
              name="reflectionChallenge"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reflectionAdditional">
              Anything else the team should know
            </Label>
            <Textarea
              id="reflectionAdditional"
              name="reflectionAdditional"
              rows={3}
            />
          </div>
        </div>
      </section>

      {state.error ? (
        <p className="text-sm font-medium text-destructive" aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        <SubmitButton />
      </div>
    </form>
  );
}
