"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { activateStudent } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";

export function ActivateStudentButton({
  studentId,
  onSuccess,
}: {
  studentId: string;
  onSuccess?: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await activateStudent(studentId);
          toast.success("Student re-activated.");
          onSuccess?.();
        })
      }
    >
      {pending ? "Activating..." : "Activate"}
    </Button>
  );
}
