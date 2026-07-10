import React from "react";
import { AlertCircle, ClipboardList, User } from "lucide-react";
import "./_group.css";

const PROFILE_FIELD_LABELS: Record<string, string> = {
  degree_program: "Degree Program",
  bank_account: "Bank Details",
  emergency_contact: "Emergency Contact",
};

const missingProfileFields = ["degree_program", "bank_account", "emergency_contact"];

const openRequest = {
  id: "req-123",
  semesterLabel: "Summer 2026",
  status: "Submitted",
};

export function TwoColumn() {
  return (
    <div className="submission-blocked-group min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)] font-sans">
      <div className="mx-auto max-w-4xl space-y-16">
        
        {/* State 1: Profile Incomplete */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Profile Incomplete</h2>
          <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="flex flex-col md:flex-row">
              {/* Left Column: Context */}
              <div className="flex w-full flex-col items-start gap-4 p-8 md:w-5/12 lg:p-10">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)]">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-[var(--card-foreground)]">Complete your profile first</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Fill in all required profile and bank details before starting a semester submission.
                  </p>
                </div>
              </div>

              {/* Right Column: Actionable */}
              <div className="flex w-full flex-col justify-center border-t border-[var(--border)] bg-[var(--muted)]/30 p-8 md:w-7/12 md:border-l md:border-t-0 lg:p-10">
                <div className="mb-6 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Missing fields</p>
                  <div className="flex flex-wrap gap-2">
                    {missingProfileFields.map((field) => (
                      <span
                        key={field}
                        className="inline-flex items-center rounded-full border border-[var(--destructive)]/20 bg-[var(--destructive)]/10 px-2.5 py-1 text-xs font-medium text-[var(--destructive)]"
                      >
                        {PROFILE_FIELD_LABELS[field]}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                    <User className="size-4" />
                    Edit profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* State 2: Open Request Exists */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Open Request</h2>
          <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="flex flex-col md:flex-row">
              {/* Left Column: Context */}
              <div className="flex w-full flex-col items-start gap-4 p-8 md:w-5/12 lg:p-10">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)]">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-[var(--card-foreground)]">Submission not available yet</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                    You already have an active payment request in progress.
                  </p>
                </div>
              </div>

              {/* Right Column: Actionable */}
              <div className="flex w-full flex-col justify-center border-t border-[var(--border)] bg-[var(--muted)]/30 p-8 md:w-7/12 md:border-l md:border-t-0 lg:p-10">
                <div className="mb-6 rounded-xl border border-[var(--border)]/70 bg-[var(--card)] p-5 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <ClipboardList className="size-4.5 text-[var(--muted-foreground)]" />
                    <p className="text-sm font-medium text-[var(--foreground)]">{openRequest.semesterLabel}</p>
                    <span className="inline-flex items-center rounded-full border border-[var(--info)]/20 bg-[var(--info)]/10 px-2 py-0.5 text-xs font-medium text-[var(--info)]">
                      {openRequest.status}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Wait until this request is marked paid or rejected before submitting again.
                  </p>
                </div>
                <div>
                  <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                    View current request
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
