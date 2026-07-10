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
      <div className="flex items-center gap-3">
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', toneClass)}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold text-[var(--foreground)]">{title}</p>
          <p className="truncate text-[13px] text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function LayoutSidebar() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          {/* Left Sidebar - Context (approx 30%) */}
          <aside className="lg:w-1/3 shrink-0 space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/15 bg-[var(--primary)]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                  <Sparkles className="size-3.5" />
                  Semester submission
                </div>
                
                <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">New Submission</h1>
                
                <p className="text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                  Hi Somchai — submit your tuition payment request and semester report together. Fill in each
                  section below; required fields are marked with an asterisk.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)]/70 bg-[var(--background)]/70 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-sm">
                  <Building2 className="size-4 shrink-0 text-[var(--primary)]" />
                  Chulalongkorn University
                </span>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)]/70 bg-[var(--background)]/70 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-sm">
                  <Calendar className="size-4 shrink-0 text-[var(--accent)]" />
                  Summer 2026
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-[var(--border)]/60 bg-[var(--background)]/40 p-4 backdrop-blur-sm">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--success-light)] text-[var(--success)]">
                <Shield className="size-4" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold">Your information stays private</p>
                <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                  Only you and the scholarship team can view this submission.
                </p>
              </div>
            </div>
          </aside>

          {/* Right Column - Status/Action (approx 70%) */}
          <main className="lg:w-2/3 flex-1 space-y-6">
            <div className="rounded-2xl border border-[var(--border)]/80 bg-[var(--card)] p-6 shadow-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SECTIONS.map((section) => (
                  <SectionPill key={section.title} {...section} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)]">
                    <AlertCircle className="size-5" />
                  </div>
                  <h2 className="font-heading text-xl font-semibold">Submission not available yet</h2>
                </div>

                <p className="max-w-sm text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                  You already have an active payment request in progress.
                </p>

                <div className="w-full max-w-md space-y-4 rounded-xl border border-[var(--border)]/70 bg-[var(--muted)]/40 p-5 text-left mt-2">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <ClipboardList className="size-4.5 text-[var(--muted-foreground)]" />
                      <p className="text-[15px] font-semibold">Summer 2026</p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                      Submitted
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Wait until this request is marked paid or rejected before submitting again.
                  </p>
                  <button className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-[var(--muted)]">
                    View current request
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
