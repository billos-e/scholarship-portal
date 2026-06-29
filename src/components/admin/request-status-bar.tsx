"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { RequestStatus } from "@prisma/client";
import { Check, ChevronDown, Wallet, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import {
  transitionRequestStatus,
  type RequestActionState,
} from "@/lib/actions/requests";
import { cn } from "@/lib/utils";

const WORKFLOW_STEPS = ["Submitted", "Validation", "Payment"] as const;

type StepVisual = "done" | "current" | "upcoming" | "approved" | "rejected";

function getStepVisuals(status: RequestStatus): StepVisual[] {
  switch (status) {
    case "SUBMITTED":
      return ["current", "upcoming", "upcoming"];
    case "APPROVED":
      return ["done", "approved", "current"];
    case "REJECTED":
      return ["done", "rejected", "upcoming"];
    case "PAID":
      return ["done", "approved", "done"];
    default:
      return ["upcoming", "upcoming", "upcoming"];
  }
}

function connectorFilled(left: StepVisual): boolean {
  return left === "done" || left === "approved" || left === "rejected";
}

function RequestWorkflowStepper({ status }: { status: RequestStatus }) {
  const visuals = getStepVisuals(status);

  return (
    <ol
      className="flex min-w-0 flex-1 items-center"
      aria-label="Request workflow progress"
    >
      {WORKFLOW_STEPS.map((label, index) => {
        const visual = visuals[index]!;
        const prevVisual = index > 0 ? visuals[index - 1]! : null;

        return (
          <li
            key={label}
            className="flex flex-1 flex-col items-center gap-1.5"
            aria-current={visual === "current" ? "step" : undefined}
          >
            <div className="flex w-full items-center">
              {index > 0 ? (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    prevVisual && connectorFilled(prevVisual)
                      ? visual === "rejected"
                        ? "bg-destructive/40"
                        : "bg-primary"
                      : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}

              <StepCircle visual={visual} index={index} />

              {index < WORKFLOW_STEPS.length - 1 ? (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    connectorFilled(visual)
                      ? visual === "rejected"
                        ? "bg-border"
                        : "bg-primary"
                      : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
            </div>

            <span
              className={cn(
                "text-center text-xs font-medium",
                visual === "current" && "text-primary",
                visual === "approved" && "text-primary",
                visual === "rejected" && "text-destructive",
                visual === "done" && "text-muted-foreground",
                visual === "upcoming" && "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StepCircle({
  visual,
  index,
}: {
  visual: StepVisual;
  index: number;
}) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
        visual === "done" &&
          "border-primary bg-primary text-primary-foreground",
        visual === "approved" &&
          "border-primary bg-primary text-primary-foreground",
        visual === "rejected" &&
          "border-destructive bg-destructive text-destructive-foreground",
        visual === "current" &&
          "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
        visual === "upcoming" &&
          "border-border bg-muted text-muted-foreground",
      )}
    >
      {visual === "done" || visual === "approved" ? (
        <Check className="size-4" />
      ) : visual === "rejected" ? (
        <X className="size-4" />
      ) : (
        index + 1
      )}
    </div>
  );
}

function PendingButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? "Updating..." : children}
    </Button>
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type RequestStatusBarProps = {
  requestId: string;
  status: RequestStatus;
  amountDue: string;
  paidAt: Date | null;
};

export function RequestStatusBar({
  requestId,
  status,
  amountDue,
  paidAt,
}: RequestStatusBarProps) {
  const [state, formAction] = useActionState<RequestActionState, FormData>(
    transitionRequestStatus,
    {},
  );
  const [showPaidForm, setShowPaidForm] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Status updated.");
      setShowPaidForm(false);
    }
    if (state.error) toast.error(state.error);
  }, [state.success, state.error]);

  function changeStatus(nextStatus: RequestStatus) {
    const fd = new FormData();
    fd.set("requestId", requestId);
    fd.set("nextStatus", nextStatus);
    startTransition(() => {
      formAction(fd);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <RequestWorkflowStepper status={status} />
        <WorkflowActions
          status={status}
          onApprove={() => changeStatus("APPROVED")}
          onReject={() => changeStatus("REJECTED")}
          onMarkPaid={() => setShowPaidForm(true)}
        />
      </div>

      {showPaidForm && status === "APPROVED" ? (
        <form
          action={formAction}
          className="rounded-xl border border-border/60 bg-background/80 p-4 backdrop-blur-sm"
        >
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="nextStatus" value="PAID" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="paymentDate">Payment date</Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                defaultValue={todayIso()}
                required
              />
              <p className="text-xs text-muted-foreground">
                Records {formatCurrency(amountDue)} as paid.
              </p>
            </div>
            <div className="flex gap-2">
              <PendingButton>Confirm payment</PendingButton>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPaidForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      ) : null}

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

function WorkflowActions({
  status,
  onApprove,
  onReject,
  onMarkPaid,
}: {
  status: RequestStatus;
  onApprove: () => void;
  onReject: () => void;
  onMarkPaid: () => void;
}) {
  if (status === "SUBMITTED" || status === "REJECTED") {
    return (
      <SplitActionButton
        label="Approve"
        onPrimary={onApprove}
        menuItems={[{ label: "Reject", onClick: onReject, destructive: true }]}
      />
    );
  }

  if (status === "APPROVED") {
    return (
      <SplitActionButton
        label="Confirm payment"
        onPrimary={onMarkPaid}
        menuItems={[
          { label: "Reject", onClick: onReject, destructive: true },
        ]}
        icon={Wallet}
      />
    );
  }

  return null;
}

function SplitActionButton({
  label,
  onPrimary,
  menuItems,
  icon: Icon,
}: {
  label: string;
  onPrimary: () => void;
  menuItems: { label: string; onClick: () => void; destructive?: boolean }[];
  icon?: typeof Wallet;
}) {
  return (
    <div className="inline-flex shrink-0 items-stretch overflow-hidden rounded-lg shadow-xs">
      <Button
        type="button"
        size="sm"
        className="rounded-r-none border-r-0 pr-2.5 shadow-none active:translate-y-0"
        onClick={onPrimary}
      >
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex h-7 min-w-7 -ml-px items-center justify-center rounded-l-none rounded-r-lg border border-transparent border-l border-primary-foreground/20 bg-primary px-1.5 text-primary-foreground transition-colors",
            "hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
        >
          <ChevronDown className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              variant={item.destructive ? "destructive" : "default"}
              onClick={item.onClick}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
