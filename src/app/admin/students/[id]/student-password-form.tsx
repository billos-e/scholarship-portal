"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { type ActionState, resetStudentPassword } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Resetting..." : "Reset password"}
    </Button>
  );
}

export function StudentPasswordForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    resetStudentPassword,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Password reset. Share the new password with the student.");
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />
      <div className="space-y-2">
        <Label htmlFor="password">New temporary password</Label>
        <Input id="password" name="password" type="text" required />
      </div>

      {state.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
