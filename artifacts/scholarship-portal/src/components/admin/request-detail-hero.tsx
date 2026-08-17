import Link from "next/link";
import {
  Building2,
  Calendar,
  GraduationCap,
  Mail,
  Wallet,
} from "lucide-react";
import type { RequestStatus } from "@prisma/client";

import { RequestStatusBar } from "@/components/admin/request-status-bar";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { StatusBadge } from "@/components/status-badge";
import { RequestCategoryBadge } from "@/components/request-category-badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/initials";
import { cn } from "@/lib/utils";
import type { RequestCategory } from "@/lib/request-category";

type RequestDetailHeroProps = {
  studentId: string;
  studentName: string;
  semesterLabel: string;
  requestCategory: RequestCategory;
  email: string;
  universityName: string | null;
  universityId: string | null;
  submittedLabel: string;
  status: RequestStatus;
  amountDue: string;
  dueDateLabel: string;
  gpa: string | null;
  requestId: string;
  amountDueRaw: string;
  paidAt: Date | null;
  onSuccess?: (patch: { status: RequestStatus; paidAt?: Date | null }) => void;
};

export function RequestDetailHero({
  studentId,
  studentName,
  semesterLabel,
  requestCategory,
  email,
  universityName,
  universityId,
  submittedLabel,
  status,
  amountDue,
  dueDateLabel,
  gpa,
  requestId,
  amountDueRaw,
  paidAt,
  onSuccess,
}: RequestDetailHeroProps) {
  const initials = getInitials(studentName);

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[
          { label: "Requests", href: "/admin/requests" },
          { label: `${studentName} — ${semesterLabel}` },
        ]}
      />

      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-fuchsia-light/40 via-transparent to-brand-orange-light/30"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/5 blur-3xl"
          aria-hidden
        />

        <div className="relative space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4 sm:gap-5">
              <Link
                href={`/admin/students/${studentId}`}
                className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-md shadow-primary/20 transition-transform hover:scale-[1.02] sm:size-16 sm:text-xl"
                title={`Open ${studentName}'s profile`}
              >
                {initials}
              </Link>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href={`/admin/students/${studentId}`}
                    className="font-heading text-2xl font-bold tracking-tight transition-colors hover:text-primary sm:text-[1.75rem]"
                  >
                    {studentName}
                  </Link>
                  <StatusBadge status={status} />
                  <RequestCategoryBadge category={requestCategory} />
                </div>
                <p className="font-heading text-lg font-medium text-primary">
                  {semesterLabel}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5 shrink-0" />
                    {email}
                  </span>
                  {universityName ? (
                    universityId ? (
                      <Link
                        href={`/admin/universities/${universityId}`}
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                      >
                        <Building2 className="size-3.5 shrink-0" />
                        {universityName}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5 shrink-0" />
                        {universityName}
                      </span>
                    )
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0" />
                    Submitted {submittedLabel}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "grid w-full shrink-0 grid-cols-2 gap-3 lg:w-auto lg:min-w-[320px]",
                gpa ? "sm:grid-cols-3" : "sm:grid-cols-2",
              )}
            >
              {gpa ? (
                <HeroMetric
                  label="Report GPA"
                  value={gpa}
                  icon={GraduationCap}
                  tone="info"
                />
              ) : null}
              <HeroMetric
                label="Amount due"
                value={amountDue}
                icon={Wallet}
                tone="primary"
              />
              <HeroMetric
                label="Due date"
                value={dueDateLabel}
                icon={Calendar}
                tone="accent"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/60 p-4 backdrop-blur-sm">
            <RequestStatusBar
              requestId={requestId}
              status={status}
              amountDue={amountDueRaw}
              paidAt={paidAt}
              onSuccess={onSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  icon: Icon,
  tone,
  className,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  tone: "primary" | "accent" | "info";
  className?: string;
}) {
  const toneClass = {
    primary: "bg-brand-fuchsia-light text-primary",
    accent: "bg-brand-orange-light text-accent",
    info: "bg-info-light text-info",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-background/70 px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            toneClass,
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="truncate font-heading text-base font-bold tabular-nums">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
