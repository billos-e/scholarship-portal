import { AlertCircle, ClipboardList, User } from "lucide-react";
import "./_group.css";

const MOCK_MISSING_FIELDS = ["Bank account", "University info", "Transcript"];

type Status = "Pending" | "Submitted" | "Paid" | "Rejected";

function StatusBadge({ status }: { status: Status }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  switch (status) {
    case "Submitted":
      return <span className={`${baseClasses} bg-[var(--info-light)] text-[var(--info)]`}>{status}</span>;
    default:
      return <span className={`${baseClasses} bg-[var(--muted)] text-[var(--muted-foreground)]`}>{status}</span>;
  }
}

export function Accordion() {
  return (
    <div className="submission-blocked-group min-h-screen bg-[var(--background)] p-8 font-sans text-[var(--foreground)]">
      <div className="mx-auto max-w-3xl space-y-12">
        
        <section>
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
            State: Profile Incomplete
          </h3>
          
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            {/* Banner Row */}
            <div className="flex flex-col border-b border-[var(--border)] bg-red-50/50 sm:flex-row sm:items-center sm:gap-4 px-6 py-4">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--destructive)]/10 p-2 text-[var(--destructive)]">
                <AlertCircle className="size-5" />
              </div>
              <div className="mt-3 sm:mt-0 flex-1">
                <h2 className="text-base font-semibold text-[var(--card-foreground)]">
                  Complete your profile first
                </h2>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  Fill in all required profile and bank details before starting a semester submission.
                </p>
              </div>
            </div>
            
            {/* Details Row */}
            <div className="flex flex-col gap-4 bg-[var(--card)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Missing fields
                </p>
                <div className="flex flex-wrap gap-2">
                  {MOCK_MISSING_FIELDS.map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center rounded-md border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 px-2 py-1 text-xs font-medium text-[var(--destructive)]"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
              <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2">
                <User className="size-4" />
                Edit profile
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
            State: Open Request Exists
          </h3>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            {/* Banner Row */}
            <div className="flex flex-col border-b border-[var(--border)] bg-[var(--muted)]/30 sm:flex-row sm:items-center sm:gap-4 px-6 py-4">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/10 p-2 text-[var(--warning)]">
                <AlertCircle className="size-5" />
              </div>
              <div className="mt-3 sm:mt-0 flex-1">
                <h2 className="text-base font-semibold text-[var(--card-foreground)]">
                  Submission not available yet
                </h2>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  You already have an active payment request in progress.
                </p>
              </div>
            </div>
            
            {/* Details Row */}
            <div className="flex flex-col gap-4 bg-[var(--card)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-2">
                 <div className="flex flex-wrap items-center gap-2.5">
                  <ClipboardList className="size-4.5 text-[var(--muted-foreground)]" />
                  <p className="text-sm font-medium text-[var(--card-foreground)]">Summer 2026</p>
                  <StatusBadge status="Submitted" />
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Wait until this request is marked paid or rejected before submitting again.
                </p>
              </div>
              <button className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2">
                View current request
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
