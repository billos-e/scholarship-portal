import Link from "next/link";
import { AlertCircle, ClipboardList, User } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      <CardHeader className="space-y-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">
            {profileIncomplete
              ? "Complete your profile first"
              : "Submission not available yet"}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {profileIncomplete
              ? "Fill in all required profile and bank details before starting a semester submission."
              : "You already have an active payment request in progress."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {profileIncomplete ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Missing fields</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {missingProfileFields.map((field) => (
                <li
                  key={field}
                  className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                >
                  {PROFILE_FIELD_LABELS[field]}
                </li>
              ))}
            </ul>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              render={<Link href="/student/profile/edit" />}
            >
              <User className="size-4" />
              Edit profile
            </Button>
          </div>
        ) : null}

        {openRequest ? (
          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
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
