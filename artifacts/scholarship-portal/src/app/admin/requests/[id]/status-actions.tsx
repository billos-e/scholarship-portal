"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updatePaymentInternalNotes,
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

export function PaymentNotesForm({
  requestId,
  value,
  onSuccess,
}: {
  requestId: string;
  value: string;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState<RequestActionState, FormData>(
    updatePaymentInternalNotes,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Payment notes saved.");
      onSuccess?.();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-3 border-t border-border/50 pt-4">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="space-y-2">
        <Label htmlFor="internalNotes">Payment internal notes</Label>
        <Textarea
          id="internalNotes"
          name="internalNotes"
          defaultValue={value}
          rows={3}
          placeholder="e.g. transfer reference, bank used..."
          className="resize-none bg-background/80"
        />
      </div>
      <PendingButton variant="outline" className="w-full sm:w-auto">
        Save payment notes
      </PendingButton>
    </form>
  );
}
