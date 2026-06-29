"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  createUniversitySemester,
  type ActionState,
} from "@/lib/actions/universities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Adding..." : "Add semester"}
    </Button>
  );
}

export function SemesterCreateForm({ universityId }: { universityId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createUniversitySemester,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Semester added.");
    if (state.error) toast.error(state.error);
  }, [state.success, state.error]);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <input type="hidden" name="universityId" value={universityId} />
      <div className="space-y-1">
        <Label htmlFor="academicYear">Academic year</Label>
        <Input id="academicYear" name="academicYear" placeholder="2026" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="termCode">Term</Label>
        <NativeSelect id="termCode" name="termCode" defaultValue="FALL">
          <option value="FALL">Fall</option>
          <option value="SPRING">Spring</option>
          <option value="SUMMER">Summer</option>
          <option value="WINTER">Winter</option>
        </NativeSelect>
      </div>
      <div className="space-y-1">
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" placeholder="Fall 2026" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="startDate">Start date</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="endDate">End date</Label>
        <Input id="endDate" name="endDate" type="date" required />
      </div>
      <div className="flex items-end">
        <SubmitButton />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive sm:col-span-full">{state.error}</p>
      ) : null}
    </form>
  );
}
