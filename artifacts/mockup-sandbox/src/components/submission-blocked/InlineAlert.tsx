import { AlertCircle, ClipboardList, User } from "lucide-react";
import "./_group.css";

const MOCK_MISSING_FIELDS = ["Bank account", "University info", "Transcript"];

type Status = "Pending" | "Submitted" | "Paid" | "Rejected";

function StatusBadge({ status }: { status: Status }) {
  const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider";
  switch (status) {
    case "Submitted":
      return <span className={`${baseClasses} bg-[var(--info-light)] text-[var(--info)]`}>{status}</span>;
    default:
      return <span className={`${baseClasses} bg-[var(--muted)] text-[var(--muted-foreground)]`}>{status}</span>;
  }
}

export function InlineAlert() {
  return (
    <div className="submission-blocked-group min-h-screen bg-[var(--background)] p-8 font-sans text-[var(--foreground)]">
      <div className="mx-auto max-w-5xl space-y-8">
        
        <section>
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
            State: Profile Incomplete
          </h3>
          
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-red-50/40 px-5 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--destructive)]/10 p-2 text-[var(--destructive)]">
                <AlertCircle className="size-4.5" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm font-semibold text-[var(--card-foreground)] whitespace-nowrap">
                  Complete your profile first
                </h2>
                <span className="hidden sm:inline text-[var(--muted-foreground)] text-sm">—</span>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-1 truncate">
                  Fill in all required profile and bank details before starting a semester submission.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pl-12 xl:pl-0 shrink-0">
              <div className="flex items-center gap-1.5 hidden md:flex">
                <span className="text-xs font-medium text-[var(--muted-foreground)] mr-1">Missing:</span>
                {MOCK_MISSING_FIELDS.map((field) => (
                  <span
                    key={field}
                    className="inline-flex items-center rounded-md border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 px-1.5 py-0.5 text-[11px] font-medium text-[var(--destructive)]"
                  >
                    {field}
                  </span>
                ))}
              </div>
              <div className="md:hidden flex items-center gap-1.5">
                  <span className="inline-flex items-center rounded-md border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 px-2 py-0.5 text-xs font-medium text-[var(--destructive)]">
                    {MOCK_MISSING_FIELDS.length} missing fields
                  </span>
              </div>
              <button className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2">
                <User className="size-3.5" />
                Edit profile
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
            State: Open Request Exists
          </h3>

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 px-5 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/10 p-2 text-[var(--warning)]">
                <AlertCircle className="size-4.5" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm font-semibold text-[var(--card-foreground)] whitespace-nowrap">
                  Submission not available yet
                </h2>
                <span className="hidden sm:inline text-[var(--muted-foreground)] text-sm">—</span>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-1 truncate">
                  You already have an active payment request in progress. Wait until it is paid or rejected.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pl-12 xl:pl-0 shrink-0">
               <div className="flex items-center gap-2">
                <ClipboardList className="size-4 hidden sm:block text-[var(--muted-foreground)]" />
                <p className="text-sm font-medium text-[var(--card-foreground)] hidden sm:block">Summer 2026</p>
                <StatusBadge status="Submitted" />
              </div>
              <button className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2">
                View current request
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
