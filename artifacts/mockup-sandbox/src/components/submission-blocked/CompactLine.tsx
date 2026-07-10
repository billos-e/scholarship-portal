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

export function CompactLine() {
  return (
    <div className="submission-blocked-group min-h-screen bg-[var(--background)] p-8 font-sans text-[var(--foreground)]">
      <div className="mx-auto max-w-4xl space-y-12">
        
        <section>
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
            State: Profile Incomplete
          </h3>
          
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
            {/* Header Line */}
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[var(--border)]/50">
              <AlertCircle className="size-4.5 text-[var(--destructive)] shrink-0" />
              <h2 className="text-sm font-semibold text-[var(--card-foreground)]">
                Complete your profile first
              </h2>
              <span className="text-[var(--border)] hidden sm:inline px-1">•</span>
              <p className="text-sm text-[var(--muted-foreground)]">
                Fill in all required profile and bank details before starting a semester submission.
              </p>
            </div>
            
            {/* Details Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] shrink-0">
                  Missing fields
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {MOCK_MISSING_FIELDS.map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center rounded-md bg-[var(--destructive)]/10 px-2 py-0.5 text-xs font-medium text-[var(--destructive)]"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
              <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2">
                <User className="size-3.5" />
                Edit profile
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
            State: Open Request Exists
          </h3>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
            {/* Header Line */}
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[var(--border)]/50">
              <AlertCircle className="size-4.5 text-[var(--warning)] shrink-0" />
              <h2 className="text-sm font-semibold text-[var(--card-foreground)]">
                Submission not available yet
              </h2>
              <span className="text-[var(--border)] hidden sm:inline px-1">•</span>
              <p className="text-sm text-[var(--muted-foreground)]">
                You already have an active payment request in progress.
              </p>
            </div>
            
            {/* Details Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3">
              <div className="flex flex-wrap items-center gap-3">
                <ClipboardList className="size-4.5 text-[var(--muted-foreground)]" />
                <p className="text-sm font-medium text-[var(--card-foreground)]">Summer 2026</p>
                <StatusBadge status="Submitted" />
                <span className="text-[var(--border)] hidden sm:inline px-1">•</span>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Wait until this request is marked paid or rejected before submitting again.
                </p>
              </div>
              <button className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-medium text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2">
                View current request
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
