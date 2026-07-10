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

export function LayoutCompact() {
  return (
    <div
      className="min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-8 font-sans"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="w-full max-w-5xl rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm">
        
        {/* Header - Very compact, single line where possible */}
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-6 items-center gap-1.5 rounded-md bg-[var(--primary)]/10 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                <Sparkles className="size-3" />
                Semester submission
              </div>
              <h1 className="font-heading text-lg font-bold">New Submission</h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--muted)]/50 px-2.5 text-xs font-medium">
                <Building2 className="size-3.5 text-[var(--primary)]" />
                Chulalongkorn University
              </span>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--muted)]/50 px-2.5 text-xs font-medium">
                <Calendar className="size-3.5 text-[var(--accent)]" />
                Summer 2026
              </span>
            </div>
          </div>
          
          <p className="text-sm leading-snug text-[var(--muted-foreground)]">
            Hi Somchai — submit your tuition payment request and semester report together. Fill in each
            section below; required fields are marked with an asterisk.
          </p>
        </div>

        {/* Section Pills and Privacy - Tightly packed */}
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] bg-[var(--muted)]/10 p-4 sm:flex-row sm:items-center sm:px-6 sm:py-3">
          <div className="flex flex-wrap items-center gap-6">
            {SECTIONS.map((section) => {
              const toneClass = {
                primary: 'text-[var(--primary)]',
                accent: 'text-[var(--accent)]',
                info: 'text-[var(--info)]',
              }[section.tone];

              return (
                <div key={section.title} className="group flex flex-col items-center gap-1.5 cursor-default">
                  <div className="flex size-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] shadow-sm transition-colors group-hover:border-[var(--primary)]/40">
                    <section.icon className={cn('size-4 opacity-70 group-hover:opacity-100 transition-opacity', toneClass)} />
                  </div>
                  <span className="text-[10px] font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                    {section.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2.5 rounded-md border border-[var(--border)]/50 bg-[var(--success-light)]/40 px-3 py-2">
            <Shield className="size-4 text-[var(--success)]" />
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-semibold leading-none text-[var(--foreground)]">Your information stays private</p>
              <p className="text-[10px] leading-none text-[var(--muted-foreground)]">
                Only you and the scholarship team can view this submission.
              </p>
            </div>
          </div>
        </div>

        {/* Blocked State - Inline Bar */}
        <div className="p-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 rounded-md border border-[var(--border)] bg-[var(--destructive)]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--destructive)] sm:mt-0" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">Submission not available yet</h2>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  You already have an active payment request in progress. Wait until it is paid or rejected.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="size-4 text-[var(--muted-foreground)]" />
                <span className="text-sm font-medium">Summer 2026</span>
                <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Submitted
                </span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <button className="text-xs font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:underline">
                View current request
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
