"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { RequestStatus } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import {
  transitionRequestStatus,
  updatePaymentInternalNotes,
  updateRequestAdminNotes,
  type RequestActionState,
} from "@/lib/actions/requests";

function PendingButton({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      className={className}
    >
      {pending ? "Saving..." : children}
    </Button>
  );
}

type StatusActionsProps = {
  requestId: string;
  status: RequestStatus;
  amountDue: string;
  paidAt: Date | null;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function StatusActions({
  requestId,
  status,
  amountDue,
  paidAt,
}: StatusActionsProps) {
  const [state, formAction] = useActionState<RequestActionState, FormData>(
    transitionRequestStatus,
    {},
  );
  const [showPaidForm, setShowPaidForm] = useState(false);

  useEffect(() => {
    if (state.success) toast.success("Status updated.");
    if (state.error) toast.error(state.error);
  }, [state.success, state.error]);

  // Once the transition succeeds the server re-renders the parent with the
  // new status, so the "Mark as paid" form unmounts on its own. We don't need
  // to call setShowPaidForm here (would trigger a redundant render warning).

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow</CardTitle>
        <CardDescription>
          Move this request through the review and payment workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {status === "SUBMITTED" ? (
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="requestId" value={requestId} />
            <input type="hidden" name="nextStatus" value="UNDER_REVIEW" />
            <p className="text-sm text-muted-foreground">
              Mark this request as being reviewed by the team.
            </p>
            <PendingButton className="w-full">Start review</PendingButton>
          </form>
        ) : null}

        {status === "UNDER_REVIEW" ? (
          <div className="space-y-3">
            <form action={formAction} className="space-y-2">
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="nextStatus" value="APPROVED" />
              <PendingButton className="w-full">Approve request</PendingButton>
            </form>
            <form action={formAction}>
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="nextStatus" value="SUBMITTED" />
              <PendingButton variant="outline" className="w-full">
                Send back to Submitted
              </PendingButton>
            </form>
          </div>
        ) : null}

        {status === "APPROVED" ? (
          <div className="space-y-3">
            {showPaidForm ? (
              <form action={formAction} className="space-y-3">
                <input type="hidden" name="requestId" value={requestId} />
                <input type="hidden" name="nextStatus" value="PAID" />
                <div className="space-y-2">
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
                  <PendingButton className="flex-1">
                    Confirm payment
                  </PendingButton>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPaidForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setShowPaidForm(true)}
                >
                  Mark as paid
                </Button>
                <form action={formAction}>
                  <input type="hidden" name="requestId" value={requestId} />
                  <input type="hidden" name="nextStatus" value="UNDER_REVIEW" />
                  <PendingButton variant="outline" className="w-full">
                    Back to Under Review
                  </PendingButton>
                </form>
              </>
            )}
          </div>
        ) : null}

        {status === "PAID" ? (
          <p className="text-sm text-muted-foreground">
            Marked as paid on{" "}
            <span className="font-medium text-foreground">
              {paidAt ? new Date(paidAt).toLocaleDateString() : "—"}
            </span>
            . No further actions available.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminNotesForm({
  requestId,
  value,
}: {
  requestId: string;
  value: string;
}) {
  const [state, formAction] = useActionState<RequestActionState, FormData>(
    updateRequestAdminNotes,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Notes saved.");
    if (state.error) toast.error(state.error);
  }, [state.success, state.error]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <Textarea
        name="adminNotes"
        defaultValue={value}
        rows={5}
        placeholder="Add private notes about this request..."
      />
      <PendingButton variant="outline">Save notes</PendingButton>
    </form>
  );
}

export function PaymentNotesForm({
  requestId,
  value,
}: {
  requestId: string;
  value: string;
}) {
  const [state, formAction] = useActionState<RequestActionState, FormData>(
    updatePaymentInternalNotes,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Payment notes saved.");
    if (state.error) toast.error(state.error);
  }, [state.success, state.error]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="space-y-2">
        <Label htmlFor="internalNotes">Payment internal notes</Label>
        <Textarea
          id="internalNotes"
          name="internalNotes"
          defaultValue={value}
          rows={3}
          placeholder="e.g. transfer reference, bank used..."
        />
      </div>
      <PendingButton variant="outline">Save payment notes</PendingButton>
    </form>
  );
}
