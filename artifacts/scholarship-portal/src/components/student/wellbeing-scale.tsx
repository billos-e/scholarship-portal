"use client";

import { useState } from "react";
import {
  Activity,
  Brain,
  Gauge,
  GraduationCap,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const VALUE_LABELS = {
  default: ["", "Very low", "Low", "Moderate", "Good", "Excellent"],
  stress: ["", "Minimal", "Mild", "Moderate", "High", "Severe"],
} as const;

type QuestionMeta = {
  icon: LucideIcon;
  title: string;
  low: string;
  high: string;
  inverted?: boolean;
  valueLabels?: keyof typeof VALUE_LABELS;
};

const QUESTION_META: Record<string, QuestionMeta> = {
  wellbeingPhysical: {
    icon: Activity,
    title: "Physical wellbeing",
    low: "Struggling",
    high: "Thriving",
  },
  wellbeingMental: {
    icon: Brain,
    title: "Mental wellbeing",
    low: "Low",
    high: "Great",
  },
  wellbeingFinancial: {
    icon: Wallet,
    title: "Financial wellbeing",
    low: "Insecure",
    high: "Secure",
  },
  wellbeingStress: {
    icon: Gauge,
    title: "Overall Stress Level",
    low: "None",
    high: "Severe",
    inverted: true,
    valueLabels: "stress",
  },
  wellbeingConfidence: {
    icon: GraduationCap,
    title: "Confidence in studies",
    low: "Uncertain",
    high: "Confident",
  },
};

const WELLBEING_GROUPS = [
  {
    title: "Health & wellbeing",
    description: "How your body and mind are doing this semester.",
    questions: ["wellbeingPhysical", "wellbeingMental", "wellbeingStress"],
  },
  {
    title: "Studies & stability",
    description: "Your financial footing and confidence at university.",
    questions: ["wellbeingFinancial", "wellbeingConfidence"],
  },
] as const;

function WellbeingScaleRow({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const meta = QUESTION_META[name] ?? {
    icon: Activity,
    title: label.replace(/\s*\([^)]*\)\s*$/, ""),
    low: "Low",
    high: "High",
  };
  const Icon = meta.icon;
  const valueLabels = VALUE_LABELS[meta.valueLabels ?? "default"];
  const selectedLabel = selected ? valueLabels[selected] : null;

  return (
    <div
      className={cn(
        "grid gap-4 px-3 py-4 transition-colors sm:px-6 sm:py-5",
        "sm:grid-cols-[minmax(0,13rem)_1fr] sm:items-center lg:grid-cols-[minmax(0,15rem)_1fr]",
        selected !== null && "bg-primary/[0.02]",
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            selected !== null
              ? "bg-brand-fuchsia-light text-primary"
              : "bg-muted/80 text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="font-heading text-sm font-semibold text-foreground">
            {meta.title}
          </p>
          <p
            className={cn(
              "text-xs",
              selectedLabel
                ? "font-medium text-primary"
                : "text-muted-foreground",
            )}
            aria-live="polite"
          >
            {selectedLabel ?? "Not rated yet"}
          </p>
        </div>
      </div>

      <div className="min-w-0 space-y-2.5 sm:pl-2">
        <div role="radiogroup" aria-label={meta.title} className="relative px-1">
          <div
            className={cn(
              "absolute left-3 right-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full",
              meta.inverted
                ? "bg-gradient-to-r from-success-light via-warning-light to-destructive/25"
                : "bg-gradient-to-r from-muted via-brand-fuchsia-light/80 to-primary/35",
            )}
            aria-hidden
          />

          <div className="relative flex items-center justify-between gap-1">
            {[1, 2, 3, 4, 5].map((value) => {
              const isSelected = selected === value;

              return (
                <label
                  key={value}
                  className="group flex flex-1 cursor-pointer justify-center"
                >
                  <input
                    type="radio"
                    name={name}
                    value={value}
                    className="sr-only"
                    aria-label={`${meta.title}: ${valueLabels[value]}`}
                    onChange={() => setSelected(value)}
                  />
                  <span
                    className={cn(
                      "relative z-10 flex size-9 items-center justify-center rounded-full border bg-card font-heading text-xs font-bold tabular-nums transition-all duration-200 ease-out sm:size-9 sm:text-sm",
                      "group-hover:border-primary/40 group-hover:shadow-sm",
                      "group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-ring group-has-[:focus-visible]:ring-offset-2",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "border-border/80 text-muted-foreground",
                    )}
                  >
                    {value}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] font-medium text-muted-foreground">
          <span>{meta.low}</span>
          <span>{meta.high}</span>
        </div>
      </div>
    </div>
  );
}

export function WellbeingScaleGrid({
  questions,
}: {
  questions: ReadonlyArray<{ readonly name: string; readonly label: string }>;
}) {
  const questionMap = new Map(questions.map((q) => [q.name, q]));

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/10">
      <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
        <p className="text-sm font-medium text-foreground">
          Rate each area from 1 to 5
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Higher is better for wellbeing and confidence. For stress, 1 means none
          and 5 means severe.
        </p>
      </div>

      {WELLBEING_GROUPS.map((group, groupIndex) => (
        <section
          key={group.title}
          className={cn(groupIndex > 0 && "border-t border-border/60")}
        >
          <div className="border-b border-border/50 bg-background/50 px-4 py-3 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
              {group.title}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {group.description}
            </p>
          </div>

          <div className="divide-y divide-border/50">
            {group.questions.map((questionName) => {
              const question = questionMap.get(questionName);
              if (!question) return null;

              return (
                <WellbeingScaleRow
                  key={question.name}
                  name={question.name}
                  label={question.label}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
