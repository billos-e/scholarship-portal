"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { RequestStatus } from "@prisma/client";
import {
  AlertTriangle,
  Ban,
  Check,
  FileText,
  RotateCcw,
  Search,
  ThumbsUp,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency } from "@/lib/format";
import {
  transitionRequestStatus,
  type RequestActionState,
} from "@/lib/actions/requests";
import {
  CLIENT_REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
  canTransitionRequest,
  requestStatusIndex,
} from "@/lib/request-status";
import { cn } from "@/lib/utils";

const STAGE_ICONS: Record<(typeof CLIENT_REQUEST_STATUSES)[number], typeof FileText> = {
  SUBMITTED: FileText,
  UNDER_REVIEW: Search,
  APPROVED: ThumbsUp,
  PAID: Wallet,
};

type StepVisual = "done" | "current" | "upcoming" | "rejected";

function getStepVisuals(status: RequestStatus): StepVisual[] {
  if (status === "REJECTED") {
    return ["done", "rejected", "upcoming", "upcoming"];
  }

  const index = requestStatusIndex(status);
  return CLIENT_REQUEST_STATUSES.map((_, stepIndex) => {
    if (index < 0) return "upcoming";
    if (stepIndex < index) return "done";
    if (stepIndex === index)
      return index === CLIENT_REQUEST_STATUSES.length - 1 ? "done" : "current";
    return "upcoming";
  });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function PendingButton({
  children,
  className,
  size = "sm",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "default";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size={size} disabled={pending} className={className}>
      {pending ? "Updating..." : children}
    </Button>
  );
}

type RequestStatusBarProps = {
  requestId: string;
  status: RequestStatus;
  amountDue: string;
  paidAt: Date | null;
  onSuccess?: (patch: { status: RequestStatus; paidAt?: Date | null }) => void;
};

export function RequestStatusBar({
  requestId,
  status,
  amountDue,
  paidAt,
  onSuccess,
}: RequestStatusBarProps) {
  const [state, formAction] = useActionState<RequestActionState, FormData>(
    transitionRequestStatus,
    {},
  );
  const [openStage, setOpenStage] = useState<RequestStatus | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  useEffect(() => {
    if (state.success && state.nextStatus) {
      toast.success("Status updated.");
      setOpenStage(null);
      setRejectOpen(false);
      const patch: { status: RequestStatus; paidAt?: Date | null } = {
        status: state.nextStatus,
      };
      if (state.nextStatus === "PAID") {
        patch.paidAt = state.paymentDate
          ? new Date(`${state.paymentDate}T00:00:00.000Z`)
          : new Date();
      }
      onSuccess?.(patch);
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  function changeStatus(nextStatus: RequestStatus) {
    const fd = new FormData();
    fd.set("requestId", requestId);
    fd.set("nextStatus", nextStatus);
    startTransition(() => {
      formAction(fd);
    });
  }

  const visuals = getStepVisuals(status);
  const canReject = canTransitionRequest(status, "REJECTED");
  const canReopen = status === "REJECTED";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex w-full min-w-0 flex-1 items-stretch overflow-hidden rounded-lg">
          {CLIENT_REQUEST_STATUSES.map((stageStatus, index) => {
            const visual = visuals[index]!;
            const Icon = STAGE_ICONS[stageStatus];
            const label = REQUEST_STATUS_LABELS[stageStatus];
            const isClickable =
              status !== "REJECTED" &&
              visual !== "current" &&
              canTransitionRequest(status, stageStatus);
            const isPaidStage = stageStatus === "PAID";
            const isFirst = index === 0;
            const isLast = index === CLIENT_REQUEST_STATUSES.length - 1;

            let stateClass =
              "bg-muted text-muted-foreground/50 cursor-not-allowed";
            if (visual === "current") {
              stateClass =
                "bg-primary text-primary-foreground shadow-sm cursor-default";
            } else if (visual === "rejected") {
              stateClass = isClickable
                ? "bg-destructive/80 text-destructive-foreground hover:bg-destructive cursor-pointer"
                : "bg-destructive/80 text-destructive-foreground cursor-default";
            } else if (visual === "done") {
              stateClass = isClickable
                ? "bg-primary/50 text-primary-foreground hover:bg-primary/70 cursor-pointer"
                : "bg-primary/50 text-primary-foreground cursor-default";
            } else if (isClickable) {
              stateClass =
                "bg-muted text-muted-foreground hover:bg-muted-foreground/20 cursor-pointer";
            }

            const chevronClip = isFirst
              ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
              : isLast
                ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)"
                : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)";

            const button = (
              <button
                type="button"
                disabled={!isClickable}
                aria-current={visual === "current" ? "step" : undefined}
                style={{ clipPath: chevronClip, marginLeft: isFirst ? 0 : -14 }}
                className={cn(
                  "group relative flex h-10 flex-1 items-center justify-center gap-2 px-4 text-xs font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5 sm:text-sm",
                  stateClass,
                )}
              >
                <Icon className="size-3.5 shrink-0 sm:size-4" />
                <span className="truncate">{label}</span>
                {visual === "done" ? (
                  <Check className="size-3.5 shrink-0 sm:size-4" />
                ) : null}
                {visual === "rejected" ? (
                  <X className="size-3.5 shrink-0 sm:size-4" />
                ) : null}
              </button>
            );

            if (!isClickable) {
              return (
                <div
                  key={stageStatus}
                  className="flex flex-1"
                  style={{ marginLeft: isFirst ? 0 : -14 }}
                >
                  {button}
                </div>
              );
            }

            return (
              <Popover
                key={stageStatus}
                open={openStage === stageStatus}
                onOpenChange={(open) => setOpenStage(open ? stageStatus : null)}
              >
                <PopoverTrigger asChild>{button}</PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="center" sideOffset={12}>
                  {isPaidStage ? (
                    <form action={formAction} className="space-y-3 p-4">
                      <input type="hidden" name="requestId" value={requestId} />
                      <input type="hidden" name="nextStatus" value="PAID" />
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Wallet className="size-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">
                            Move to {label}?
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Records {formatCurrency(amountDue)} as paid.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="paymentDate" className="text-xs">
                          Payment date
                        </Label>
                        <Input
                          id="paymentDate"
                          name="paymentDate"
                          type="date"
                          defaultValue={todayIso()}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenStage(null)}
                        >
                          Cancel
                        </Button>
                        <PendingButton>Confirm move</PendingButton>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <AlertTriangle className="size-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">
                            Move to {label}?
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            This will update the request status.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenStage(null)}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => changeStatus(stageStatus)}>
                          Confirm move
                        </Button>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {status === "REJECTED" ? (
            <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
              <X className="mr-1 size-3" />
              Rejected
            </Badge>
          ) : null}

          {canReopen ? (
            <Button type="button" size="sm" variant="outline" onClick={() => changeStatus("UNDER_REVIEW")}>
              <RotateCcw className="size-3.5" />
              Reopen
            </Button>
          ) : null}

          {canReject ? (
            <Popover open={rejectOpen} onOpenChange={setRejectOpen}>
              <PopoverTrigger asChild>
                <Button type="button" size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Ban className="size-3.5" />
                  Reject
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end" sideOffset={12}>
                <div className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                      <Ban className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Reject this request?</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        The request will be marked as rejected.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setRejectOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => changeStatus("REJECTED")}
                    >
                      Confirm reject
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </div>

      {status === "PAID" ? (
        <p className="text-center text-xs text-muted-foreground">
          Paid on{" "}
          <span className="font-medium text-foreground">
            {paidAt ? new Date(paidAt).toLocaleDateString() : "—"}
          </span>
        </p>
      ) : null}
    </div>
  );
}
