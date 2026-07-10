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

function BigSectionCard({
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
    <div className="flex-shrink-0 w-64 snap-start rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className={cn('mb-5 flex size-12 items-center justify-center rounded-xl', toneClass)}>
        <Icon className="size-6" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--muted-foreground)] leading-relaxed">{description}</p>
    </div>
  );
}

export function LayoutSplit() {
  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Top band: compact, low-height header bar */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-5 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-[var(--primary)]/15 bg-[var(--primary)]/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                <Sparkles className="size-3" />
                Semester submission
              </div>
              <div className="h-4 w-px bg-[var(--border)] hidden sm:block"></div>
              <h1 className="font-heading text-xl font-bold tracking-tight">New Submission</h1>
            </div>
            
            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--muted)]/30 px-2.5 py-1.5 text-xs font-medium">
                <Building2 className="size-3.5 shrink-0 text-[var(--primary)]" />
                Chulalongkorn University
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--muted)]/30 px-2.5 py-1.5 text-xs font-medium">
                <Calendar className="size-3.5 shrink-0 text-[var(--accent)]" />
                Summer 2026
              </span>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            Hi Somchai — submit your tuition payment request and semester report together. Fill in each
            section below; required fields are marked with an asterisk.
          </p>
        </div>
      </header>

      {/* Wide horizontal strip for sections */}
      <main className="flex-1 px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex overflow-x-auto pb-6 pt-2 -mt-2 gap-5 snap-x">
            {SECTIONS.map((section) => (
              <BigSectionCard key={section.title} {...section} />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)]/50 px-4 py-3 max-w-max">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--success-light)] text-[var(--success)]">
              <Shield className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Your information stays private</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Only you and the scholarship team can view this submission.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Blocked state full-width horizontal banner */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)] px-6 py-6 lg:px-10 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            <div className="flex items-center gap-4 lg:w-1/3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--destructive)]/10 text-[var(--destructive)]">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Submission not available yet</h2>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  You already have an active payment request in progress.
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-5 justify-between rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="size-4.5 text-[var(--muted-foreground)]" />
                  <p className="text-sm font-semibold text-[var(--foreground)]">Summer 2026</p>
                  <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                    Submitted
                  </span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Wait until this request is marked paid or rejected before submitting again.
                </p>
              </div>
              <button className="shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2">
                View current request
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
