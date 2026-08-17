import {
  BookOpen,
  Building2,
  Calendar,
  GraduationCap,
  Heart,
  Landmark,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  REQUEST_CATEGORY_LABELS,
  type RequestCategory,
} from "@/lib/request-category";

const SECTIONS = [
  {
    icon: Calendar,
    title: "Semester",
    description: "Term you're reporting",
    tone: "primary" as const,
  },
  {
    icon: Wallet,
    title: "Tuition",
    description: "Invoice & payment details",
    tone: "accent" as const,
  },
  {
    icon: Landmark,
    title: "Bank",
    description: "Payout account info",
    tone: "info" as const,
  },
  {
    icon: GraduationCap,
    title: "Academic",
    description: "GPA & transcript",
    tone: "primary" as const,
  },
  {
    icon: Heart,
    title: "Wellbeing",
    description: "How you're doing",
    tone: "accent" as const,
  },
  {
    icon: BookOpen,
    title: "Reflections",
    description: "Your semester story",
    tone: "info" as const,
  },
] as const;

type SubmissionHeroProps = {
  firstName: string;
  universityName: string | null;
  semesterHint: string | null;
  category?: RequestCategory | null;
};

export function SubmissionHero({
  firstName,
  universityName,
  semesterHint,
  category,
}: SubmissionHeroProps) {
  const categoryLabel = category ? REQUEST_CATEGORY_LABELS[category] : null;
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-fuchsia-light/50 via-transparent to-brand-orange-light/35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-accent/5 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-5 p-4 sm:space-y-6 sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              <Sparkles className="size-3.5" />
              Semester submission
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
                {categoryLabel ? `${categoryLabel} submission` : "New Submission"}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {categoryLabel
                  ? `Hi ${firstName} — you chose ${categoryLabel.toLowerCase()}. Fill in the same semester payment details and academic report as any other payment type.`
                  : `Hi ${firstName} — choose a payment type, then submit your payment request and semester report together.`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {universityName ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm">
                <Building2 className="size-3.5 shrink-0 text-primary" />
                {universityName}
              </span>
            ) : null}
            {semesterHint ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm">
                <Calendar className="size-3.5 shrink-0 text-accent" />
                {semesterHint}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {SECTIONS.map((section) => (
            <SectionPill key={section.title} {...section} />
          ))}
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/65 px-4 py-3 backdrop-blur-sm">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-light text-success">
            <Shield className="size-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              Your information stays private
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Only you and the scholarship team can view this submission.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionPill({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: "primary" | "accent" | "info";
}) {
  const toneClass = {
    primary: "bg-brand-fuchsia-light text-primary",
    accent: "bg-brand-orange-light text-accent",
    info: "bg-info-light text-info",
  }[tone];

  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-3 backdrop-blur-sm transition-colors hover:border-primary/20">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            toneClass,
          )}
        >
          <Icon className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-[13px] font-semibold text-foreground">
            {title}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
