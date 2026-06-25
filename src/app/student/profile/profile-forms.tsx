"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  type ActionState,
  updateOwnBank,
  updateOwnProfile,
} from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function ContactForm({ phone }: { phone: string | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateOwnProfile,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Contact details updated.");
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="max-w-sm space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={phone ?? ""} />
      </div>
      {state.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <SubmitButton label="Save contact" />
    </form>
  );
}

export type BankValues = {
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
};

export function BankForm({ bank }: { bank: BankValues }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateOwnBank,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Bank information updated.");
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bankAccountName">Account name</Label>
          <Input
            id="bankAccountName"
            name="bankAccountName"
            defaultValue={bank.bankAccountName ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankAccountNumber">Account number</Label>
          <Input
            id="bankAccountNumber"
            name="bankAccountNumber"
            defaultValue={bank.bankAccountNumber ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank name</Label>
          <Input id="bankName" name="bankName" defaultValue={bank.bankName ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promptpayNumber">PromptPay number</Label>
          <Input
            id="promptpayNumber"
            name="promptpayNumber"
            defaultValue={bank.promptpayNumber ?? ""}
          />
        </div>
      </div>
      {state.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <SubmitButton label="Save bank info" />
    </form>
  );
}
