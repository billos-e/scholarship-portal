import type { RequestStatus } from "@prisma/client";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS: { status: RequestStatus; label: string }[] = [
  { status: "SUBMITTED", label: "Submitted" },
  { status: "UNDER_REVIEW", label: "Under Review" },
  { status: "APPROVED", label: "Approved" },
  { status: "PAID", label: "Paid" },
];

const STATUS_ORDER: RequestStatus[] = STEPS.map((s) => s.status);

function stepIndex(status: RequestStatus): number {
  return STATUS_ORDER.indexOf(status);
}

type StatusStepperProps = {
  status: RequestStatus;
  compact?: boolean;
  className?: string;
};

export function StatusStepper({
  status,
  compact = false,
  className,
}: StatusStepperProps) {
  const current = stepIndex(status);

  return (
    <ol
      className={cn(
        "flex w-full items-center",
        compact ? "gap-1" : "gap-2",
        className,
      )}
      aria-label="Request status progress"
    >
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
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
  );
}
