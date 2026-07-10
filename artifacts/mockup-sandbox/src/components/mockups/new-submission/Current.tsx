import './_group.css';
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  ClipboardList,
  GraduationCap,
  Heart,
  Landmark,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const SECTIONS = [
  { icon: Calendar, title: 'Semester', description: "Term you're reporting", tone: 'primary' as const },
  { icon: Wallet, title: 'Tuition', description: 'Invoice & payment details', tone: 'accent' as const },
  { icon: Landmark, title: 'Bank', description: 'Payout account info', tone: 'info' as const },
  { icon: GraduationCap, title: 'Academic', description: 'GPA & transcript', tone: 'primary' as const },
  { icon: Heart, title: 'Wellbeing', description: "How you're doing", tone: 'accent' as const },
  { icon: BookOpen, title: 'Reflections', description: 'Your semester story', tone: 'info' as const },
];

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
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
  tone: 'primary' | 'accent' | 'info';
}) {
  const toneClass = {
    primary: 'bg-[var(--brand-fuchsia-light)] text-[var(--primary)]',
    accent: 'bg-[var(--brand-orange-light)] text-[var(--accent)]',
    info: 'bg-[var(--info-light)] text-[var(--info)]',
  }[tone];

  return (
    <div className="rounded-xl border border-[var(--border)]/60 bg-[var(--background)]/70 p-3 backdrop-blur-sm transition-colors hover:border-[var(--primary)]/20">
      <div className="flex items-center gap-2.5">
        <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', toneClass)}>
          <Icon className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-[13px] font-semibold text-[var(--foreground)]">{title}</p>
          <p className="truncate text-[11px] text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function Current() {
  return (
    <div
      className="min-h-screen space-y-6 p-6 font-sans"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-[var(--card)] shadow-sm">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom right, color-mix(in srgb, var(--brand-fuchsia-light) 50%, transparent), transparent, color-mix(in srgb, var(--brand-orange-light) 35%, transparent))',
          }}
        />
        <div className="relative space-y-5 p-4 sm:space-y-6 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/15 bg-[var(--primary)]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                <Sparkles className="size-3.5" />
                Semester submission
              </div>
              <div className="space-y-2">
                <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-[1.75rem]">New Submission</h1>
                <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Hi Somchai — submit your tuition payment request and semester report together. Fill in each
                  section below; required fields are marked with an asterisk.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)]/70 bg-[var(--background)]/70 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                <Building2 className="size-3.5 shrink-0 text-[var(--primary)]" />
                Chulalongkorn University
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)]/70 bg-[var(--background)]/70 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                <Calendar className="size-3.5 shrink-0 text-[var(--accent)]" />
                Summer 2026
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {SECTIONS.map((section) => (
              <SectionPill key={section.title} {...section} />
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[var(--border)]/60 bg-[var(--background)]/65 px-4 py-3 backdrop-blur-sm">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--success-light)] text-[var(--success)]">
              <Shield className="size-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium">Your information stays private</p>
              <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                Only you and the scholarship team can view this submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-none">
        <div className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)]">
              <AlertCircle className="size-4.5" />
            </div>
            <h2 className="font-heading text-xl font-semibold">Submission not available yet</h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
            You already have an active payment request in progress.
          </p>

          <div className="w-full max-w-sm space-y-3 rounded-xl border border-[var(--border)]/70 bg-[var(--muted)]/40 p-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <ClipboardList className="size-4 text-[var(--muted-foreground)]" />
              <p className="text-sm font-medium">Summer 2026</p>
              <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                Submitted
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              Wait until this request is marked paid or rejected before submitting again.
            </p>
            <button className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">
              View current request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
