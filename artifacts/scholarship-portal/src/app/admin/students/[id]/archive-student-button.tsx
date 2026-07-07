"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { archiveStudent, type ActionState } from "@/lib/actions/students";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";

export function ArchiveStudentButton({
  studentId,
  onSuccess,
}: {
  studentId: string;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    archiveStudent,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Student archived.");
      onSuccess?.();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            Archive
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive student?</AlertDialogTitle>
          <AlertDialogDescription>
            This disables login access while preserving payment history. Choose
            the archive status below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={studentId} />
          <NativeSelect name="status" defaultValue="INACTIVE">
            <option value="INACTIVE">Inactive</option>
            <option value="GRADUATED">Graduated</option>
          </NativeSelect>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Confirm archive</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
