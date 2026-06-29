import type { RequestStatus } from "@prisma/client";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS: { status: RequestStatus; label: string }[] = [
  { status: "SUBMITTED", label: "Submitted" },
  { status: "APPROVED", label: "Approved" },
  { status: "PAID", label: "Paid" },
];

const STATUS_ORDER: RequestStatus[] = STEPS.map((s) => s.status);

function stepIndex(status: RequestStatus): number {
  if (status === "REJECTED") return -1;
  return STATUS_ORDER.indexOf(status);
}

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
  const current = stepIndex(status);
  const rejected = status === "REJECTED";

  if (variant === "dots") {
    return (
      <ol
        className={cn("flex w-full max-w-lg items-start gap-2", className)}
        aria-label="Request status progress"
      >
        {STEPS.map((step, index) => {
          const active = index === current;
          const done = index < current || (active && index === STEPS.length - 1);

          return (
            <li
              key={step.status}
              className="flex flex-1 flex-col items-center gap-1.5"
              aria-current={active ? "step" : undefined}
            >
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-colors",
                  rejected && "bg-border opacity-40",
                  !rejected && done && "bg-primary text-primary-foreground",
                  !rejected && active && !done && "bg-primary text-primary-foreground",
                  !rejected && !done && !active && "bg-border",
                )}
              >
                {done && !rejected ? <Check className="size-3.5" /> : null}
              </div>
              <span
                className={cn(
                  "text-center text-[11px]",
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
                ) : null}
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full border-2 font-medium transition-colors",
                    compact ? "size-6 text-[10px]" : "size-8 text-xs",
                    done && "border-primary bg-primary text-primary-foreground",
                    active &&
                      !done &&
                      "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
                    upcoming && "border-border bg-muted text-muted-foreground",
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
                ) : null}
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
