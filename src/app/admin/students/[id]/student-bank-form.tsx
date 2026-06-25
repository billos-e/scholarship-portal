"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { type ActionState, updateStudentBank } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BankData = {
  studentId: string;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Saving..." : "Save bank info"}
    </Button>
  );
}

export function StudentBankForm({ bank }: { bank: BankData }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateStudentBank,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Bank information updated.");
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="studentId" value={bank.studentId} />
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

      <SubmitButton />
    </form>
  );
}
