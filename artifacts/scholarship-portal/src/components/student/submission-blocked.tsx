import Link from "next/link";
import { AlertCircle, ClipboardList, User } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  PROFILE_FIELD_LABELS,
  type OpenRequestSummary,
  type ProfileField,
} from "@/lib/submissions/eligibility";

type SubmissionBlockedProps = {
  missingProfileFields: ProfileField[];
  openRequest: OpenRequestSummary | null;
};

export function SubmissionBlocked({
  missingProfileFields,
  openRequest,
}: SubmissionBlockedProps) {
  const profileIncomplete = missingProfileFields.length > 0;

  return (
    <Card className="border-border shadow-none">
      <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
        {/* Icon + title on same line, centered */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertCircle className="size-4.5" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {profileIncomplete
              ? "Complete your profile first"
              : "Submission not available yet"}
          </h2>
        </div>

        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {profileIncomplete
            ? "Fill in all required profile and bank details before starting a semester submission."
            : "You already have an active payment request in progress."}
        </p>

        {profileIncomplete ? (
          <>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Missing fields
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {missingProfileFields.map((field) => (
                  <span
                    key={field}
                    className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/8 px-2.5 py-0.5 text-xs font-medium text-destructive"
                  >
                    {PROFILE_FIELD_LABELS[field]}
                  </span>
                ))}
              </div>
            </div>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              render={<Link href="/student/profile/edit" />}
            >
              <User className="size-4" />
              Edit profile
            </Button>
          </>
        ) : null}

        {openRequest ? (
          <div className="w-full max-w-sm space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <ClipboardList className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">{openRequest.semesterLabel}</p>
              <StatusBadge status={openRequest.status} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Wait until this request is marked paid or rejected before
              submitting again.
            </p>
            <Button variant="outline" render={<Link href={`/student/history/${openRequest.id}`} />}>
              View current request
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
