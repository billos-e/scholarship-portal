"use client";

import { useActionState, useEffect, useState, useCallback, useTransition, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useFormDraft } from "@/lib/use-form-draft";
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/auth/session";

import { FormFileField } from "@/components/form-file-field";
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
  REFLECTION_QUESTIONS,
  SEMESTER_LABEL_SUGGESTIONS,
  WELLBEING_QUESTIONS,
} from "@/lib/submissions/constants";
import { cn } from "@/lib/utils";
import {
  REQUEST_CATEGORY_LABELS,
  type RequestCategory,
} from "@/lib/request-category";
import {
  formatBankAccountOption,
  isCompleteBankAccount,
} from "@/lib/bank-accounts";
import type { BankAccount } from "@/lib/api/students";

type SemesterOption = { id: string; label: string };

type Defaults = {
  semesterLabel: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  promptpayNumber: string;
  bankAccounts: BankAccount[];
};

const STEPS = [
  { id: 1, label: "Semester", icon: Calendar },
  { id: 2, label: "Payment", icon: FileText },
  { id: 3, label: "Semester Report", icon: GraduationCap },
];

/* ── Step Indicator ─────────────────────────────────────────── */

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                  done
                    ? "border-success bg-success text-white"
                    : active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  active
                    ? "text-primary"
                    : done
                      ? "text-success"
                      : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 mb-5 h-0.5 w-10 transition-all duration-300",
                  current > step.id ? "bg-success/60" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Reusable field pieces ────────────────────────────────── */

function StepHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden>
      {" "}*
    </span>
  );
}

function YesNoToggle({
  name,
  label,
  defaultValue = "",
  onValueChange,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
}) {
  const [val, setVal] = useState(defaultValue);
  const options = [
    { value: "true", label: "Yes", tone: "success" as const },
    { value: "false", label: "No", tone: "destructive" as const },
  ];
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        {options.map((opt) => {
          const active = val === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setVal(opt.value); onValueChange?.(opt.value); }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? opt.tone === "success"
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-border bg-card text-muted-foreground hover:border-border/80",
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-sm border text-[10px] font-bold",
                  active
                    ? opt.tone === "success"
                      ? "border-success bg-success text-success-foreground"
                      : "border-destructive bg-destructive text-destructive-foreground"
                    : "border-border bg-transparent text-transparent",
                )}
              >
                {opt.tone === "success" ? "\u2713" : "\u2717"}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
      <input type="hidden" name={name} value={val} />
    </div>
  );
}

function RatingRow({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: number;
}) {
  const [selected, setSelected] = useState<number | null>(defaultValue ?? null);
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2.5 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="group flex cursor-pointer flex-col items-center"
          >
            <input
              type="radio"
              name={name}
              value={n}
              className="sr-only"
              defaultChecked={n === (defaultValue ?? null)}
              onChange={() => setSelected(n)}
            />
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                selected === n
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : selected !== null && selected >= n
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              {n}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ChoiceGrid({
  name,
  options,
  defaultSelected,
  onSelectionChange,
}: {
  name: string;
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  defaultSelected?: string[];
  onSelectionChange?: (values: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelected));

  function toggle(value: string) {
    const next = new Set(selected);
    next.has(value) ? next.delete(value) : next.add(value);
    setSelected(next);
    onSelectionChange?.([...next]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selected.size > 0 &&
        [...selected].map((v) => (
          <input key={v} type="hidden" name={name} value={v} />
        ))}
      {options.map((opt) => {
        const active = selected.has(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Step contents ──────────────────────────────────────────── */

function Step1({ semesters, defaults = {} }: { semesters: SemesterOption[]; defaults?: Record<string, string> }) {
  return (
    <div className="space-y-5">
      <StepHeader
        title="Select Semester"
        description="Choose the semester this submission covers."
      />
      <div className="space-y-2">
        <Label htmlFor="semester">
          Semester
          <RequiredMark />
        </Label>
        {semesters.length > 0 ? (
          <>
            <NativeSelect
              id="semester"
              name="universitySemesterId"
              required
              defaultValue={defaults.universitySemesterId ?? ""}
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
              placeholder="Fall 2026"
              defaultValue={defaults.semesterLabel ?? ""}
            />
            <datalist id="semester-suggestions">
              {SEMESTER_LABEL_SUGGESTIONS.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              No semesters configured — enter the term name manually.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Step2({
  defaults = {},
  requestCategory,
  bankAccounts = [],
  selectedBankId,
  onBankAccountChange,
}: {
  defaults?: Record<string, string>;
  requestCategory: RequestCategory;
  bankAccounts?: BankAccount[];
  selectedBankId?: string;
  onBankAccountChange?: (id: string) => void;
}) {
  const categoryLabel = REQUEST_CATEGORY_LABELS[requestCategory];
  const completeAccounts = bankAccounts.filter(isCompleteBankAccount);
  return (
    <div className="space-y-5">
      <StepHeader
        title={`${categoryLabel} payment`}
        description="Enter the amount, due date, and any supporting documents."
      />
      {completeAccounts.length > 1 ? (
        <div className="space-y-2">
          <Label htmlFor="bankAccountId">Bank account for this payment</Label>
          <NativeSelect
            id="bankAccountId"
            name="bankAccountId"
            value={selectedBankId}
            onChange={(event) => onBankAccountChange?.(event.target.value)}
          >
            {completeAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {formatBankAccountOption(account)}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amountDue">
            Amount due (THB)
            <RequiredMark />
          </Label>
          <Input
            id="amountDue"
            name="amountDue"
            type="number"
            required
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="25000"
            defaultValue={defaults.amountDue ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">
            Due date
            <RequiredMark />
          </Label>
          <Input id="dueDate" name="dueDate" type="date" required defaultValue={defaults.dueDate ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormFileField
          id="invoiceFile"
          name="invoiceFile"
          label="Invoice / bill"
          hint="PDF, JPG or PNG"
          accept="application/pdf,image/jpeg,image/png"
          optional
        />
        <FormFileField
          id="screenshotFile"
          name="screenshotFile"
          label="Payment screenshot"
          hint="JPG or PNG"
          accept="image/jpeg,image/png"
          optional
          variant="image"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message to admin</Label>
        <Textarea
          id="message"
          name="message"
          rows={3}
          className="resize-y"
          placeholder="Optional — any notes or context you'd like to share with the admin team…"
          defaultValue={defaults.message ?? ""}
        />
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 border-t border-border/60 pt-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Step3({
  defaults = {},
  defaultChallenges,
  defaultActivities,
  onToggleChange,
  onChallengesChange,
  onActivitiesChange,
}: {
  defaults?: Record<string, string>;
  defaultChallenges?: string[];
  defaultActivities?: string[];
  onToggleChange?: (name: string, v: string) => void;
  onChallengesChange?: (v: string[]) => void;
  onActivitiesChange?: (v: string[]) => void;
}) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Semester Report"
        description="Academic progress, wellbeing, activities, and reflections for this semester."
      />

      <SectionBlock
        title="Academic report"
        description="Share your academic progress this semester."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gpa">GPA (0–4)</Label>
            <Input
              id="gpa"
              name="gpa"
              type="number"
              min="0"
              max="4"
              step="0.01"
              inputMode="decimal"
              placeholder="3.50"
              defaultValue={defaults.gpa ?? ""}
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
              defaultValue={defaults.creditsCompleted ?? ""}
            />
          </div>
        </div>
        <YesNoToggle
          name="withdrawnFromCourses"
          label="Have you had to withdraw from any courses this semester?"
          defaultValue={defaults.withdrawnFromCourses ?? ""}
          onValueChange={(v) => onToggleChange?.("withdrawnFromCourses", v)}
        />
        <div className="space-y-2">
          <Label htmlFor="academicComment">Comments (optional)</Label>
          <textarea
            id="academicComment"
            name="academicComment"
            rows={3}
            maxLength={2000}
            placeholder="Any additional comments about your academic performance this semester…"
            defaultValue={defaults.academicComment ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
        </div>
        <FormFileField
          id="transcriptFile"
          name="transcriptFile"
          label="Transcript"
          hint="PDF, JPG or PNG"
          accept="application/pdf,image/jpeg,image/png"
          optional
        />
        <div className="space-y-5 border-t border-border/60 pt-5">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Awards</h4>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Optional — you can select neither, one, or both.
            </p>
          </div>
          <YesNoToggle
            name="receivedAcademicExcellenceAward"
            label="Did you receive an academic excellence award this semester?"
            defaultValue={defaults.receivedAcademicExcellenceAward ?? ""}
            onValueChange={(v) =>
              onToggleChange?.("receivedAcademicExcellenceAward", v)
            }
          />
          <YesNoToggle
            name="receivedOtherAward"
            label="Did you receive any other award this semester?"
            defaultValue={defaults.receivedOtherAward ?? ""}
            onValueChange={(v) => onToggleChange?.("receivedOtherAward", v)}
          />
          <FormFileField
            id="awardFiles"
            name="awardFiles"
            label="Award documents"
            hint="PDF, JPG or PNG — you can select more than one"
            accept="application/pdf,image/jpeg,image/png"
            optional
            multiple
          />
          <div className="space-y-2">
            <Label htmlFor="awardsComment">Awards comment (optional)</Label>
            <textarea
              id="awardsComment"
              name="awardsComment"
              rows={3}
              maxLength={2000}
              placeholder="Any comments about awards you received this semester…"
              defaultValue={defaults.awardsComment ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock
        title="Wellbeing"
        description="Rate your wellbeing and tell us about current challenges."
      >
        <div>
          <Label className="mb-2 block text-sm font-medium">
            Rate each area (1 = low, 5 = high)
          </Label>
          <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-1">
            {WELLBEING_QUESTIONS.map((q) => (
              <RatingRow
                key={q.name}
                name={q.name}
                label={q.label}
                defaultValue={
                  defaults[q.name] ? Number(defaults[q.name]) : undefined
                }
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current challenges</Label>
          <ChoiceGrid
            name="challenges"
            options={CHALLENGE_OPTIONS}
            defaultSelected={defaultChallenges}
            onSelectionChange={onChallengesChange}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        title="Activities"
        description="What you took part in this semester."
      >
        <div className="space-y-2">
          <Label className="text-sm font-medium">Activities & involvement</Label>
          <ChoiceGrid
            name="activities"
            options={ACTIVITY_OPTIONS}
            defaultSelected={defaultActivities}
            onSelectionChange={onActivitiesChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="activitiesComment">Comments on your activities</Label>
          <Textarea
            id="activitiesComment"
            name="activitiesComment"
            rows={3}
            maxLength={2000}
            className="resize-y"
            placeholder="Optional — add context about the activities you selected…"
            defaultValue={defaults.activitiesComment ?? ""}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        title="Reflections"
        description="Three questions about this semester."
      >
        {REFLECTION_QUESTIONS.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea
              id={field.name}
              name={field.name}
              rows={4}
              maxLength={4000}
              className="resize-y"
              placeholder={field.placeholder}
              defaultValue={defaults[field.name] ?? ""}
            />
          </div>
        ))}
      </SectionBlock>
    </div>
  );
}

/* ── Submit button ──────────────────────────────────────────── */

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
    >
      <Check className="size-4" />
      {pending ? "Submitting…" : "Submit"}
    </Button>
  );
}

/* ── Main form ──────────────────────────────────────────────── */

export function SubmissionForm({
  defaults,
  semesters = [],
  requestCategory,
}: {
  defaults: Defaults;
  semesters?: SemesterOption[];
  requestCategory: RequestCategory;
}) {
  const { get, save, onFormChange, clearDraft } = useFormDraft(
    `draft:submission:${requestCategory}`,
  );
  const completeBankAccounts = (defaults.bankAccounts ?? []).filter(
    isCompleteBankAccount,
  );
  const [selectedBankId, setSelectedBankId] = useState(
    () => get("bankAccountId", completeBankAccounts[0]?.id ?? ""),
  );
  const selectedBank =
    completeBankAccounts.find((account) => account.id === selectedBankId) ??
    completeBankAccounts[0];
  const [step, setStep] = useState(() => {
    const saved = Number(get("__step", "1"));
    if (!Number.isInteger(saved) || saved < 1) return 1;
    return Math.min(saved, STEPS.length);
  });
  const total = STEPS.length;
  const [stepError, setStepError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const user = getCurrentUser();
  const studentProfileId = user?.studentProfileId ?? null;

  const [state, formAction] = useActionState<SubmissionState, FormData>(
    createSubmission,
    {},
  );

  const isProfileError = Boolean(
    state.error?.startsWith("Complete your profile"),
  );

  useEffect(() => {
    if (state.error && !isProfileError) toast.error(state.error);
  }, [state.error, isProfileError]);

  useEffect(() => {
    if (state.success) {
      clearDraft();
      if (studentProfileId) {
        queryClient.invalidateQueries({ queryKey: ["student", studentProfileId] });
      }
      if (state.requestId) {
        navigate(`/student/history/${state.requestId}`);
      }
    }
  }, [state.success, state.requestId]);

  const validateStep = useCallback(
    (s: number, form: HTMLFormElement): boolean => {
      setStepError(null);
      const fd = new FormData(form);

      if (s === 1) {
        const hasSemesterId = trimmed(fd.get("universitySemesterId"));
        const hasLabel = trimmed(fd.get("semesterLabel"));
        if (!hasSemesterId && !hasLabel) {
          setStepError("Please select or enter a semester.");
          return false;
        }
      }

      if (s === 2) {
        const amount = trimmed(fd.get("amountDue"));
        const due = trimmed(fd.get("dueDate"));
        if (!amount || Number(amount) <= 0) {
          setStepError("Please enter a valid amount.");
          return false;
        }
        if (!due) {
          setStepError("Please select a due date.");
          return false;
        }
      }

      return true;
    },
    [],
  );

  const handleNext = useCallback(
    (form: HTMLFormElement) => {
      if (validateStep(step, form)) {
        setStep((v) => {
          const next = Math.min(total, v + 1);
          save({ __step: String(next) });
          return next;
        });
      }
    },
    [step, total, validateStep, save],
  );

  const stepContent = [
    <Step1 key={1} semesters={semesters} defaults={{ universitySemesterId: get("universitySemesterId"), semesterLabel: get("semesterLabel") }} />,
    <Step2
      key={2}
      requestCategory={requestCategory}
      bankAccounts={completeBankAccounts}
      selectedBankId={selectedBank?.id}
      onBankAccountChange={(id) => {
        setSelectedBankId(id);
        save({ bankAccountId: id });
      }}
      defaults={{
        amountDue: get("amountDue"),
        dueDate: get("dueDate"),
        message: get("message"),
      }}
    />,
    <Step3
      key={3}
      defaults={{
        gpa: get("gpa"),
        creditsCompleted: get("creditsCompleted"),
        withdrawnFromCourses: get("withdrawnFromCourses"),
        academicComment: get("academicComment"),
        receivedAcademicExcellenceAward: get("receivedAcademicExcellenceAward"),
        receivedOtherAward: get("receivedOtherAward"),
        awardsComment: get("awardsComment"),
        activitiesComment: get("activitiesComment"),
        ...Object.fromEntries(
          WELLBEING_QUESTIONS.map((q) => [q.name, get(q.name)]),
        ),
        ...Object.fromEntries(
          REFLECTION_QUESTIONS.map((q) => [q.name, get(q.name)]),
        ),
      }}
      onToggleChange={(name, v) => save({ [name]: v })}
      defaultChallenges={JSON.parse(get("__chips_challenges", "[]"))}
      onChallengesChange={(v) => save({ __chips_challenges: JSON.stringify(v) })}
      defaultActivities={JSON.parse(get("__chips_activities", "[]"))}
      onActivitiesChange={(v) => save({ __chips_activities: JSON.stringify(v) })}
    />,
  ];

  return (
    <form
      className="space-y-6"
      encType="multipart/form-data"
      id="submission-form"
      onChange={onFormChange}
      onSubmit={(e) => {
        e.preventDefault();
        if (step < total) {
          handleNext(e.currentTarget);
        } else {
          // Snapshot all string fields to localStorage before the action runs,
          // so the draft is fully up-to-date if the submission fails.
          const fd = new FormData(e.currentTarget);
          const snapshot: Record<string, string> = {};
          for (const [k, v] of fd.entries()) {
            if (typeof v === "string") snapshot[k] = v;
          }
          save(snapshot);
          // Call the action manually so React never resets the form DOM.
          // This keeps all text fields and file previews intact on failure.
          // clearDraft() is still called only on success (see useEffect above).
          const payload = new FormData(e.currentTarget);
          startTransition(() => formAction(payload));
        }
      }}
    >
      {/* Hidden bank inputs (auto-populated, not shown) */}
      <input type="hidden" name="requestCategory" value={requestCategory} />
      {completeBankAccounts.length <= 1 ? (
        <input type="hidden" name="bankAccountId" value={selectedBank?.id ?? ""} />
      ) : null}
      <input
        type="hidden"
        name="bankAccountName"
        value={selectedBank?.bankAccountName ?? defaults.bankAccountName}
      />
      <input
        type="hidden"
        name="bankAccountNumber"
        value={selectedBank?.bankAccountNumber ?? defaults.bankAccountNumber}
      />
      <input
        type="hidden"
        name="bankName"
        value={selectedBank?.bankName ?? defaults.bankName}
      />
      <input
        type="hidden"
        name="promptpayNumber"
        value={selectedBank?.promptpayNumber ?? defaults.promptpayNumber}
      />

      {isProfileError && state.error ? (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-muted-foreground">
              {state.error}{" "}
              <Link
                href="/student/profile/edit"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Edit profile
              </Link>
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            clearDraft();
            navigate("/student");
          }}
        >
          Cancel
        </Button>
      </div>

      <StepIndicator current={step} />

      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
        {stepContent.map((content, idx) => (
          <div key={idx} className={cn(idx + 1 !== step && "hidden")}>
            {content}
          </div>
        ))}

        {stepError ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
            {stepError}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStepError(null);
                setStep((s) => {
                  const prev = Math.max(1, s - 1);
                  save({ __step: String(prev) });
                  return prev;
                });
              }}
              className="gap-1.5"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
          ) : (
            <span className="w-[4.5rem]" />
          )}

          <div className="flex items-center gap-1.5">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "rounded-full transition-all duration-200",
                  s.id === step
                    ? "h-2 w-5 bg-primary"
                    : s.id < step
                      ? "h-2 w-2 bg-success"
                      : "h-2 w-2 bg-muted",
                )}
              />
            ))}
          </div>

          {step < total ? (
            <Button
              type="button"
              onClick={(e) => {
                const form = (e.currentTarget as HTMLElement).closest(
                  "form",
                ) as HTMLFormElement;
                if (form) handleNext(form);
              }}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <SubmitButton pending={isPending} />
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Step {step} of {total} · Bank details are auto-loaded from your profile
      </p>
    </form>
  );
}

/* helpers */
function trimmed(v: FormDataEntryValue | null): string | undefined {
  const s = (v as string | null)?.trim();
  return s && s.length > 0 ? s : undefined;
}
