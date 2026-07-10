import { AlertCircle, ClipboardList, User, ArrowRight } from "lucide-react";
import "./_group.css";

const MOCK_MISSING_FIELDS = ["Bank account", "University info", "Transcript"];

type Status = "Pending" | "Submitted" | "Paid" | "Rejected";

function StatusBadge({ status }: { status: Status }) {
  const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase";
  switch (status) {
    case "Submitted":
      return <span className={`${baseClasses} bg-[var(--info-light)] text-[var(--info)]`}>{status}</span>;
    default:
      return <span className={`${baseClasses} bg-[var(--muted)] text-[var(--muted-foreground)]`}>{status}</span>;
  }
}

export function Minimal() {
  return (
    <div className="submission-blocked-group min-h-screen bg-[var(--background)] p-8 font-sans text-[var(--foreground)]">
      <div className="mx-auto max-w-2xl space-y-12">
        
        <section>
          <h3 className="mb-4 text-xs font-medium tracking-widest text-[var(--muted-foreground)] uppercase">
            State: Profile Incomplete
          </h3>
          
          <div className="rounded-xl bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-[var(--destructive)]" />
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-base font-medium text-[var(--card-foreground)]">
                    Complete your profile first
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Fill in all required profile and bank details before starting a semester submission.
                  </p>
                </div>

                <div className="h-px bg-[var(--border)]" />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">
                      Missing fields
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_MISSING_FIELDS.map((field) => (
                        <span
                          key={field}
                          className="text-xs font-medium text-[var(--destructive)] before:content-['•'] before:mr-1.5 before:text-[var(--destructive)]/50"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2">
                    <User className="size-4" />
                    Edit profile
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xs font-medium tracking-widest text-[var(--muted-foreground)] uppercase">
            State: Open Request Exists
          </h3>

          <div className="rounded-xl bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-[var(--warning)]" />
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-base font-medium text-[var(--card-foreground)]">
                    Submission not available yet
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    You already have an active payment request in progress.
                  </p>
                </div>

                <div className="h-px bg-[var(--border)]" />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="size-4 text-[var(--muted-foreground)]" />
                      <span className="text-sm font-medium text-[var(--card-foreground)]">Summer 2026</span>
                      <StatusBadge status="Submitted" />
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Wait until this request is marked paid or rejected before submitting again.
                    </p>
                  </div>
                  
                  <button className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2">
                    View current request
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
