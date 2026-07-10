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

export function LayoutAside() {
  return (
    <div
      className="min-h-screen font-sans p-4 sm:p-6 md:p-8 flex justify-center items-start"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
        {/* Main Content: Blocked State */}
        <main className="flex-1">
          <div className="rounded-[2rem] border-2 border-[var(--border)] bg-[var(--card)] p-8 sm:p-12 shadow-lg relative overflow-hidden">
             <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                background: 'radial-gradient(circle at top left, var(--destructive) 0%, transparent 60%)',
              }}
            />
            <div className="relative">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--destructive)]/10 text-[var(--destructive)] mb-8 shadow-sm ring-1 ring-[var(--destructive)]/20">
                <AlertCircle className="size-10" />
              </div>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--foreground)]">
                Submission not available yet
              </h2>
              <p className="text-lg leading-relaxed text-[var(--muted-foreground)] mb-12 max-w-md">
                You already have an active payment request in progress.
              </p>

              <div className="max-w-md rounded-2xl border border-[var(--border)] bg-[var(--muted)]/50 p-6 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-sm">
                      <ClipboardList className="size-5 text-[var(--muted-foreground)]" />
                    </div>
                    <p className="font-semibold text-[var(--foreground)] text-lg">Summer 2026</p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[13px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] shadow-sm">
                    Submitted
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed text-[var(--muted-foreground)] mb-8">
                  Wait until this request is marked paid or rejected before submitting again.
                </p>
                <button className="w-full inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 text-[15px] font-semibold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--muted)] hover:border-[var(--muted-foreground)]/30 active:scale-[0.98]">
                  View current request
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Aside: Context & Info */}
        <aside className="lg:w-[380px] shrink-0 space-y-6">
          <div className="rounded-2xl border border-[var(--border)]/60 bg-[var(--card)]/50 p-6 backdrop-blur-sm shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/15 bg-[var(--primary)]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-4">
              <Sparkles className="size-3" />
              Semester submission
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight mb-3">
              New Submission
            </h1>
            <p className="text-[14px] leading-relaxed text-[var(--muted-foreground)] mb-5">
              Hi Somchai — submit your tuition payment request and semester report together. Fill in each section below; required fields are marked with an asterisk.
            </p>

            <div className="flex flex-col gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)]/80 bg-[var(--card)] px-3 py-2 text-[13px] font-medium shadow-sm">
                <Building2 className="size-4 text-[var(--primary)] shrink-0" />
                Chulalongkorn University
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)]/80 bg-[var(--card)] px-3 py-2 text-[13px] font-medium shadow-sm">
                <Calendar className="size-4 text-[var(--accent)] shrink-0" />
                Summer 2026
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)]/60 bg-[var(--card)]/50 p-4 backdrop-blur-sm shadow-sm">
            <div className="space-y-2">
              {SECTIONS.map((section) => {
                const toneClass = {
                  primary: 'bg-[var(--brand-fuchsia-light)] text-[var(--primary)]',
                  accent: 'bg-[var(--brand-orange-light)] text-[var(--accent)]',
                  info: 'bg-[var(--info-light)] text-[var(--info)]',
                }[section.tone];

                return (
                  <div
                    key={section.title}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-[var(--background)] transition-colors"
                  >
                    <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', toneClass)}>
                      <section.icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-[13px] font-semibold text-[var(--foreground)]">
                        {section.title}
                      </p>
                      <p className="truncate text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)]/60 bg-[var(--card)]/50 p-4 backdrop-blur-sm shadow-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--success-light)] text-[var(--success)]">
              <Shield className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[var(--foreground)]">Your information stays private</p>
              <p className="text-[12px] leading-relaxed text-[var(--muted-foreground)] mt-0.5">
                Only you and the scholarship team can view this submission.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
