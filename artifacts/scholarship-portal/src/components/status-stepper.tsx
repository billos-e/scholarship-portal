import type { RequestStatus } from "@prisma/client";
import { Check, X } from "lucide-react";

import {
  CLIENT_REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
  requestStatusIndex,
} from "@/lib/request-status";
import { cn } from "@/lib/utils";

const STEPS = CLIENT_REQUEST_STATUSES.map((status) => ({
  status,
  label: REQUEST_STATUS_LABELS[status],
}));

type StatusStepperProps = {
  status: RequestStatus;
  compact?: boolean;
  variant?: "default" | "dots";
  className?: string;
};

export function StatusStepper({
  status,
  compact = false,
  variant = "default",
  className,
}: StatusStepperProps) {
  const current = requestStatusIndex(status);
  const rejected = status === "REJECTED";

  if (variant === "dots") {
    return (
      <ol
        className={cn("flex w-full max-w-lg items-start", className)}
        aria-label="Request status progress"
      >
        {STEPS.map((step, index) => {
          const active = index === current;
          const done = index < current || (active && index === STEPS.length - 1);

          return (
            <li
              key={step.status}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:gap-1.5"
              aria-current={active ? "step" : undefined}
            >
              <div className="flex w-full items-center">
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    !rejected && (done || active) ? "bg-primary" : "bg-border",
                    rejected && "bg-border opacity-40",
                  )}
                  aria-hidden
                />
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 leading-none transition-colors sm:size-7",
                    rejected && "border-border bg-border opacity-40",
                    !rejected && done && "border-primary bg-primary text-primary-foreground",
                    !rejected && active && !done && "border-primary bg-primary text-primary-foreground",
                    !rejected && !done && !active && "border-primary/40 bg-transparent",
                  )}
                >
                  {done && !rejected ? <Check className="size-3 sm:size-3.5" /> : null}
                </div>
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    !rejected && done ? "bg-primary" : "bg-border",
                    rejected && "bg-border opacity-40",
                  )}
                  aria-hidden
                />
              </div>
              <span
                className={cn(
                  "max-w-full truncate text-center text-[10px] leading-tight sm:text-[11px]",
                  active && !rejected
                    ? "font-medium text-primary"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {rejected ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <X className="size-4 shrink-0" />
          <span className="font-medium">Request rejected</span>
        </div>
      ) : null}

      <ol
        className={cn(
          "flex w-full items-center",
          compact ? "gap-1" : "gap-2",
          rejected && "opacity-50",
        )}
        aria-label="Request status progress"
      >
        {STEPS.map((step, index) => {
          const active = index === current;
          const done =
            index < current || (active && index === STEPS.length - 1);
          const upcoming = index > current;

          return (
            <li
              key={step.status}
              className={cn(
                "flex flex-1 flex-col items-center gap-1",
                compact && "min-w-0",
              )}
              aria-current={active ? "step" : undefined}
            >
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      done || active ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                ) : (
                  <div className="h-0.5 flex-1 invisible" aria-hidden />
                )}
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full border-2 font-medium leading-none transition-colors",
                    compact ? "size-6 text-[10px]" : "size-8 text-xs",
                    done && "border-primary bg-primary text-primary-foreground",
                    active &&
                      !done &&
                      "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
                    upcoming && "border-primary/40 bg-transparent text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className={compact ? "size-3" : "size-4"} />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 ? (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      done ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                ) : (
                  <div className="h-0.5 flex-1 invisible" aria-hidden />
                )}
              </div>
              <span
                className={cn(
                  "text-center font-medium",
                  compact
                    ? "hidden text-[10px] sm:block sm:truncate sm:max-w-full"
                    : "text-xs",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
