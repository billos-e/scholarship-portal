import Link from "next/link";
import {
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  type LucideIcon,
} from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import {
  REQUEST_CATEGORIES,
  REQUEST_CATEGORY_DESCRIPTIONS,
  REQUEST_CATEGORY_LABELS,
  type RequestCategory,
} from "@/lib/request-category";
import type { RequestStatus } from "@/lib/api/requests";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<RequestCategory, LucideIcon> = {
  TUITION: GraduationCap,
  LIVING_EXPENSES: Home,
  STUDY_ABROAD_INTERNSHIP: Plane,
  EMERGENCY_AID: HeartPulse,
};

const CATEGORY_TONE: Record<RequestCategory, string> = {
  TUITION: "bg-brand-fuchsia-light text-primary",
  LIVING_EXPENSES: "bg-brand-orange-light text-accent",
  STUDY_ABROAD_INTERNSHIP: "bg-info-light text-info",
  EMERGENCY_AID: "bg-warning-light text-warning",
};

export type CategoryOpenRequest = {
  id: string;
  semesterLabel: string;
  status: RequestStatus;
};

type RequestCategoryPickerProps = {
  hrefFor: (category: RequestCategory) => string;
  openByCategory?: Partial<Record<RequestCategory, CategoryOpenRequest | null>>;
  heading?: string;
  description?: string;
};

export function RequestCategoryPicker({
  hrefFor,
  openByCategory,
  heading = "Choose a payment type",
  description = "Pick the kind of support you need. You will then fill in the same semester submission for every type — payment details plus your academic report.",
}: RequestCategoryPickerProps) {
  return (
    <section className="space-y-4" aria-labelledby="payment-type-heading">
      <div className="space-y-1.5">
        <h2
          id="payment-type-heading"
          className="font-heading text-xl font-semibold tracking-tight"
        >
          {heading}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {REQUEST_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICON[category];
          const open = openByCategory?.[category] ?? null;
          const blocked = Boolean(open);

          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-[10px]",
                    CATEGORY_TONE[category],
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </div>
                {blocked && open ? <StatusBadge status={open.status} /> : null}
              </div>
              <div className="space-y-1">
                <p className="font-heading text-base font-semibold text-foreground">
                  {REQUEST_CATEGORY_LABELS[category]}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {blocked && open
                    ? `In progress for ${open.semesterLabel}. Wait until it is paid or rejected before submitting this type again.`
                    : REQUEST_CATEGORY_DESCRIPTIONS[category]}
                </p>
              </div>
            </>
          );

          if (blocked && open) {
            return (
              <Link
                key={category}
                href={`/student/history/${open.id}`}
                className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 opacity-80 transition-colors hover:border-primary/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
                aria-label={`${REQUEST_CATEGORY_LABELS[category]} — in progress, view current request`}
              >
                {content}
              </Link>
            );
          }

          return (
            <Link
              key={category}
              href={hrefFor(category)}
              className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
              aria-label={`Start ${REQUEST_CATEGORY_LABELS[category]} submission`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function openRequestsByCategory<
  T extends { requestCategory: RequestCategory; status: RequestStatus },
>(
  requests: T[],
  blocking: readonly RequestStatus[],
): Partial<Record<RequestCategory, T>> {
  const map: Partial<Record<RequestCategory, T>> = {};
  for (const request of requests) {
    if (!blocking.includes(request.status)) continue;
    if (!map[request.requestCategory]) map[request.requestCategory] = request;
  }
  return map;
}
