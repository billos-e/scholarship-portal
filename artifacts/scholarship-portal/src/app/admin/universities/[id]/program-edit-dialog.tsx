"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createUniversityDegreeProgram,
  updateUniversityDegreeProgram,
  type ActionState,
} from "@/lib/actions/universities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ProgramEditValues = {
  id: string;
  name: string;
  isActive: boolean;
};

export function ProgramEditDialog({
  universityId,
  program,
  open,
  onOpenChange,
  onSuccess,
}: {
  universityId: string;
  program: ProgramEditValues | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const isEdit = program !== null;
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) setError(undefined);
  }, [open, program?.id]);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const action = isEdit
        ? updateUniversityDegreeProgram
        : createUniversityDegreeProgram;
      const result: ActionState = await action({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(isEdit ? "Program updated." : "Program added.");
      onOpenChange(false);
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit degree program" : "Add degree program"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the program name. Drag tiles between columns to change availability."
              : "New programs are added to the Active column."}
          </DialogDescription>
        </DialogHeader>

        <form
          key={isEdit ? program.id : "create"}
          action={onSubmit}
          className="space-y-4"
        >
          {isEdit ? <input type="hidden" name="id" value={program.id} /> : null}
          <input type="hidden" name="universityId" value={universityId} />
          <input
            type="hidden"
            name="isActive"
            value={isEdit ? (program.isActive ? "on" : "off") : "on"}
          />

          <div className="space-y-2">
            <Label htmlFor="program-name">Program name</Label>
            <Input
              id="program-name"
              name="name"
              defaultValue={program?.name ?? ""}
              placeholder="e.g. Economics, Medicine"
              required
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Add program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
