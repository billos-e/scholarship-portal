import React from 'react';
import { AlertCircle, ClipboardList, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import './_group.css';

// mock data for the variants
const PROFILE_FIELD_LABELS: Record<string, string> = {
  nationalId: "National ID",
  dob: "Date of Birth",
  bankAccount: "Bank Account",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[var(--success-light)] text-[var(--success)]">
      {status}
    </span>
  );
}

export function Timeline() {
  const missingProfileFields = ["nationalId", "dob", "bankAccount"];
  const openRequest = {
    id: "req-1",
    semesterLabel: "Summer 2026",
    status: "Submitted",
  };

  return (
    <div className="submission-blocked-group min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 font-sans flex flex-col gap-12 items-center">
      
      {/* State 1: Profile incomplete */}
      <div className="w-full max-w-2xl mt-8">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Profile Incomplete</h3>
        <Card className="border-[var(--border)] shadow-sm bg-[var(--card)] rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              {/* Icon Left Anchor */}
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--destructive)]/10 text-[var(--destructive)]">
                <AlertCircle className="size-7" />
              </div>
              
              {/* Content Right */}
              <div className="flex flex-col gap-6 flex-1 pt-1 sm:pt-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">
                    Complete your profile first
                  </h2>
                  <p className="text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                    Fill in all required profile and bank details before starting a semester submission.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Missing fields
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missingProfileFields.map((field) => (
                      <span
                        key={field}
                        className="inline-flex items-center rounded-full border border-[var(--destructive)]/20 bg-[var(--destructive)]/10 px-3 py-1 text-[13px] font-medium text-[var(--destructive)]"
                      >
                        {PROFILE_FIELD_LABELS[field]}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Button
                    className="bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent)]/90 gap-2 h-10 px-5 rounded-lg shadow-sm"
                  >
                    <User className="size-4" />
                    Edit profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* State 2: Open request exists */}
      <div className="w-full max-w-2xl mb-12">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Open Request</h3>
        <Card className="border-[var(--border)] shadow-sm bg-[var(--card)] rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              {/* Icon Left Anchor */}
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                <AlertCircle className="size-7" />
              </div>
              
              {/* Content Right */}
              <div className="flex flex-col gap-6 flex-1 pt-1 sm:pt-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">
                    Submission not available yet
                  </h2>
                  <p className="text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                    You already have an active payment request in progress.
                  </p>
                </div>

                <div className="w-full space-y-4 rounded-xl border border-[var(--border)]/70 bg-[var(--muted)]/40 p-5 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <ClipboardList className="size-4.5 text-[var(--muted-foreground)]" />
                    <p className="text-[15px] font-medium text-[var(--foreground)]">{openRequest.semesterLabel}</p>
                    <StatusBadge status={openRequest.status} />
                  </div>
                  <p className="text-[14px] leading-relaxed text-[var(--muted-foreground)]">
                    Wait until this request is marked paid or rejected before
                    submitting again.
                  </p>
                  <Button variant="outline" className="h-9 px-4 rounded-md border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/60 bg-[var(--card)]">
                    View current request
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

export default Timeline;
