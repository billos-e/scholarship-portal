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
    <div className="flex-shrink-0 w-56 rounded-xl border border-[var(--border)]/60 bg-[var(--background)]/70 p-3 backdrop-blur-sm transition-colors hover:border-[var(--primary)]/20 snap-start">
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

export function LayoutTimeline() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="mx-auto max-w-4xl py-12 px-6 sm:px-10">
        
        {/* Timeline Container */}
        <div className="relative border-l-2 border-[var(--border)] pl-8 sm:pl-12 ml-4 sm:ml-6 space-y-16">
          
          {/* Node 1: Context */}
          <div className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[39px] sm:-left-[55px] top-1 flex size-4 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--background)]">
              <div className="size-1.5 rounded-full bg-[var(--muted-foreground)]/40" />
            </div>

            <div className="space-y-6">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/15 bg-[var(--primary)]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                  <Sparkles className="size-3.5" />
                  Semester submission
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">New Submission</h1>
                <p className="text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                  Hi Somchai — submit your tuition payment request and semester report together. Fill in each
                  section below; required fields are marked with an asterisk.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)]/70 bg-[var(--card)]/50 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                  <Building2 className="size-3.5 shrink-0 text-[var(--primary)]" />
                  Chulalongkorn University
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)]/70 bg-[var(--card)]/50 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                  <Calendar className="size-3.5 shrink-0 text-[var(--accent)]" />
                  Summer 2026
                </span>
              </div>
            </div>
          </div>

          {/* Node 2: Sections */}
          <div className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[39px] sm:-left-[55px] top-1/2 -translate-y-1/2 flex size-4 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--background)]">
              <div className="size-1.5 rounded-full bg-[var(--muted-foreground)]/40" />
            </div>

            <div className="space-y-4">
              <div className="flex overflow-x-auto pb-4 gap-3 snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {SECTIONS.map((section) => (
                  <SectionPill key={section.title} {...section} />
                ))}
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[var(--border)]/60 bg-[var(--card)]/50 px-4 py-3 backdrop-blur-sm max-w-lg">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--success-light)] text-[var(--success)]">
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
          </div>

          {/* Node 3: Status (Blocked) */}
          <div className="relative">
            {/* Active Timeline Dot */}
            <div className="absolute -left-[45px] sm:-left-[61px] top-6 flex size-7 items-center justify-center rounded-full bg-[var(--destructive)]/10 ring-4 ring-[var(--background)]">
              <div className="size-3 rounded-full bg-[var(--destructive)]" />
            </div>

            <div className="rounded-2xl border-2 border-[var(--destructive)]/20 bg-[var(--card)] p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  background: 'repeating-linear-gradient(45deg, var(--destructive) 0, var(--destructive) 1px, transparent 1px, transparent 8px)'
                }}
              />
              
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-4 max-w-sm">
                  <div className="flex items-center gap-2.5 text-[var(--destructive)]">
                    <AlertCircle className="size-5" />
                    <h2 className="font-heading text-lg font-semibold">Submission not available yet</h2>
                  </div>
                  <p className="text-[14px] leading-relaxed text-[var(--muted-foreground)]">
                    You already have an active payment request in progress. Wait until this request is marked paid or rejected before submitting again.
                  </p>
                </div>

                <div className="w-full sm:w-[320px] shrink-0 space-y-4 rounded-xl border border-[var(--border)]/70 bg-[var(--muted)]/40 p-4 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <ClipboardList className="size-4 text-[var(--muted-foreground)]" />
                    <p className="text-sm font-medium">Summer 2026</p>
                    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                      Submitted
                    </span>
                  </div>
                  <button className="w-full inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[13px] font-medium shadow-sm hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                    View current request
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
