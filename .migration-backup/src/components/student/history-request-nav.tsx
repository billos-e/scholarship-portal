"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type HistoryRequestItem = {
  id: string;
  semesterLabel: string;
  amountDue: string;
  submittedAt: Date;
  status: Parameters<typeof StatusBadge>[0]["status"];
};

type HistoryRequestNavProps = {
  requests: HistoryRequestItem[];
};

export function HistoryRequestNav({ requests }: HistoryRequestNavProps) {
  const pathname = usePathname();

  if (requests.length === 0) {
    return (
      <p className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
        No submissions yet.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: horizontal scroll strip */}
      <nav
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
        aria-label="Submission history"
      >
        {requests.map((request) => {
          const href = `/student/history/${request.id}`;
          const active = pathname === href;

          return (
            <Link
              key={request.id}
              href={href}
              className={cn(
                "flex min-w-[9.5rem] shrink-0 snap-start flex-col gap-1 rounded-xl border px-3.5 py-3 transition-colors",
                active
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-border/80 bg-card hover:border-primary/25 hover:bg-muted/30",
              )}
              aria-current={active ? "page" : undefined}
            >
              <p className="truncate text-sm font-medium">{request.semesterLabel}</p>
              <p className="truncate text-xs text-muted-foreground">
                {formatCurrency(request.amountDue)}
              </p>
              <StatusBadge status={request.status} />
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical sidebar */}
      <aside className="hidden space-y-1 rounded-lg border bg-card p-2 lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
        {requests.map((request) => {
          const href = `/student/history/${request.id}`;
          const active = pathname === href;

          return (
            <Link
              key={request.id}
              href={href}
              className={cn(
                "block rounded-md px-3 py-2.5 transition-colors",
                active
                  ? "bg-primary/5 ring-1 ring-primary/20"
                  : "hover:bg-muted",
              )}
              aria-current={active ? "page" : undefined}
            >
              <p className="text-sm font-medium">{request.semesterLabel}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(request.amountDue)} ·{" "}
                {formatDate(request.submittedAt)}
              </p>
              <div className="mt-1.5">
                <StatusBadge status={request.status} />
              </div>
            </Link>
          );
        })}
      </aside>
    </>
  );
}
