"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { TermCode } from "@/shims/prisma-client";

import {
  createUniversitySemester,
  updateUniversitySemester,
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
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";

export type SemesterEditValues = {
  id: string;
  label: string;
  academicYear: string;
  termCode: TermCode;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
};

function toDateInputValue(value: Date | string): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

export function SemesterEditDialog({
  universityId,
  semester,
  hasSummerSemester,
  open,
  onOpenChange,
  onSuccess,
}: {
  universityId: string;
  semester: SemesterEditValues | null;
  hasSummerSemester?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const isEdit = semester !== null;
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) setError(undefined);
  }, [open, semester?.id]);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const action = isEdit ? updateUniversitySemester : createUniversitySemester;
      const result: ActionState = await action({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(isEdit ? "Semester updated." : "Semester added.");
      onOpenChange(false);
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit semester" : "Add semester"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update term dates and availability for student submissions."
              : "Configure a new term for student submissions."}
          </DialogDescription>
        </DialogHeader>

        <form
          key={isEdit ? semester.id : "create"}
          action={onSubmit}
          className="space-y-4"
        >
          {isEdit ? <input type="hidden" name="id" value={semester.id} /> : null}
          <input type="hidden" name="universityId" value={universityId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="semester-academicYear">Academic year</Label>
              <Input
                id="semester-academicYear"
                name="academicYear"
                defaultValue={semester?.academicYear ?? ""}
                placeholder="2026"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester-termCode">Term</Label>
              <NativeSelect
                id="semester-termCode"
                name="termCode"
                defaultValue={semester?.termCode ?? "FALL"}
              >
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                {hasSummerSemester || semester?.termCode === "SUMMER" ? (
                  <option value="SUMMER">Summer</option>
                ) : null}
                <option value="WINTER">Winter</option>
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester-label">Label</Label>
            <Input
              id="semester-label"
              name="label"
              defaultValue={semester?.label ?? ""}
              placeholder="Fall 2026"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="semester-startDate">Start date</Label>
              <Input
                id="semester-startDate"
                name="startDate"
                type="date"
                defaultValue={
                  semester ? toDateInputValue(semester.startDate) : undefined
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester-endDate">End date</Label>
              <Input
                id="semester-endDate"
                name="endDate"
                type="date"
                defaultValue={
                  semester ? toDateInputValue(semester.endDate) : undefined
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="semester-isActive">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive semesters are hidden from new submissions.
              </p>
            </div>
            <Switch
              id="semester-isActive"
              name="isActive"
              defaultChecked={semester?.isActive ?? true}
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
                  : "Add semester"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
