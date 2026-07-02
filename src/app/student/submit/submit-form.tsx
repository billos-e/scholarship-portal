"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Heart,
  Landmark,
  MessageSquare,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { RequestSectionCard } from "@/components/admin/request-section-card";
import { FormFileField } from "@/components/form-file-field";
import { WellbeingScaleGrid } from "@/components/student/wellbeing-scale";
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
import { cn } from "@/lib/utils";

type SemesterOption = { id: string; label: string };

type Defaults = {
  semesterLabel: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  promptpayNumber: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full min-w-0 bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto sm:min-w-[180px]"
    >
      {pending ? "Submitting..." : "Submit semester"}
    </Button>
  );
}

function ChoiceGrid({
  name,
  options,
}: {
  name: string;
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-background px-4 py-3.5 text-sm transition-colors",
            "hover:border-primary/25 hover:bg-primary/[0.03]",
            "has-[:checked]:border-primary has-[:checked]:bg-primary/5",
          )}
        >
          <input
            type="checkbox"
            name={name}
            value={opt.value}
            className="size-4 shrink-0 accent-primary"
          />
          <span className="leading-snug">{opt.label}</span>
        </label>
      ))}
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
    <form
      action={formAction}
      className="space-y-6"
      encType="multipart/form-data"
    >
      <RequestSectionCard
        title="Semester"
        description="Which semester this submission is for."
        icon={Calendar}
        tone="primary"
      >
        <div className="space-y-2">
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
      </RequestSectionCard>

      <RequestSectionCard
        title="Tuition payment"
        description="Amount, due date and the official invoice from your university."
        icon={Wallet}
        tone="accent"
      >
        <div className="grid gap-5 sm:grid-cols-2">
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
          <FormFileField
            id="invoiceFile"
            name="invoiceFile"
            label="Invoice upload"
            hint="PDF, JPG, or PNG · max 10 MB · optional"
            accept="application/pdf,image/jpeg,image/png"
            optional
            className="sm:col-span-2"
          />
          <FormFileField
            id="screenshotFile"
            name="screenshotFile"
            label="Payment screenshot"
            hint="JPG or PNG · optional"
            accept="image/jpeg,image/png"
            optional
            variant="image"
            className="sm:col-span-2"
          />
        </div>
      </RequestSectionCard>

      <RequestSectionCard
        title="Bank information"
        description="Optional. A snapshot is saved with this submission if you fill these in."
        icon={Landmark}
        tone="info"
      >
        <div className="grid gap-5 sm:grid-cols-2">
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
            <Input
              id="bankName"
              name="bankName"
              defaultValue={defaults.bankName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promptpayNumber">PromptPay number</Label>
            <Input
              id="promptpayNumber"
              name="promptpayNumber"
              defaultValue={defaults.promptpayNumber}
            />
          </div>
        </div>
      </RequestSectionCard>

      <RequestSectionCard
        title="Academic report"
        description="Optional. Share your performance for this semester if you have it ready."
        icon={GraduationCap}
        tone="primary"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          <FormFileField
            id="transcriptFile"
            name="transcriptFile"
            label="Transcript"
            hint="PDF, JPG, or PNG · max 10 MB"
            accept="application/pdf,image/jpeg,image/png"
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>
      </RequestSectionCard>

      <RequestSectionCard
        title="Wellbeing"
        description="How you're doing this semester — grouped by health, studies, and stability."
        icon={Heart}
        tone="accent"
      >
        <WellbeingScaleGrid questions={WELLBEING_QUESTIONS} />
      </RequestSectionCard>

      <RequestSectionCard
        title="Challenges"
        description="Select any that apply this semester."
        icon={BookOpen}
        tone="info"
      >
        <ChoiceGrid name="challenges" options={CHALLENGE_OPTIONS} />
      </RequestSectionCard>

      <RequestSectionCard
        title="Activities"
        description="Select any that apply this semester."
        icon={Sparkles}
        tone="primary"
      >
        <ChoiceGrid name="activities" options={ACTIVITY_OPTIONS} />
      </RequestSectionCard>

      <RequestSectionCard
        title="Reflections"
        description="A few open-ended questions to help us support you."
        icon={MessageSquare}
        tone="accent"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="reflectionAchievement">
              Your biggest achievement this semester
            </Label>
            <Textarea
              id="reflectionAchievement"
              name="reflectionAchievement"
              rows={3}
              className="resize-y"
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
              className="resize-y"
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
              className="resize-y"
            />
          </div>
        </div>
      </RequestSectionCard>

      {state.error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
          aria-live="polite"
        >
          {state.error}
        </p>
      ) : null}

      <div className="sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-10 -mx-4 border-t border-border/80 bg-background/95 px-4 py-4 backdrop-blur-sm md:bottom-0 md:-mx-8 md:px-8 md:pb-0">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-left">
            Only semester and tuition amount are required. Bank details, academic
            report, and profile updates can be added later.
          </p>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
