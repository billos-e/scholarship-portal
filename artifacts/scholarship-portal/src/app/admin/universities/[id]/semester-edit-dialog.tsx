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

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function getDefaultTermDates(
  termCode: TermCode,
  academicYear: string,
): { start: string; end: string } | null {
  const year = Number(academicYear);
  if (!Number.isFinite(year) || academicYear.trim().length < 4) return null;

  switch (termCode) {
    case "FALL":
      return { start: toIsoDate(year, 9, 1), end: toIsoDate(year, 12, 20) };
    case "SPRING":
      return { start: toIsoDate(year, 1, 10), end: toIsoDate(year, 5, 15) };
    case "SUMMER":
      return { start: toIsoDate(year, 6, 1), end: toIsoDate(year, 8, 15) };
    case "WINTER":
      return { start: toIsoDate(year, 12, 1), end: toIsoDate(year + 1, 2, 15) };
    default:
      return null;
  }
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

  const [academicYear, setAcademicYear] = useState(semester?.academicYear ?? "");
  const [termCode, setTermCode] = useState<TermCode>(semester?.termCode ?? "FALL");
  const [startDate, setStartDate] = useState(
    semester ? toDateInputValue(semester.startDate) : "",
  );
  const [endDate, setEndDate] = useState(
    semester ? toDateInputValue(semester.endDate) : "",
  );
  const [datesTouched, setDatesTouched] = useState(isEdit);

  useEffect(() => {
    if (open) {
      setError(undefined);
      setAcademicYear(semester?.academicYear ?? "");
      setTermCode(semester?.termCode ?? "FALL");
      setStartDate(semester ? toDateInputValue(semester.startDate) : "");
      setEndDate(semester ? toDateInputValue(semester.endDate) : "");
      setDatesTouched(isEdit);
    }
  }, [open, semester?.id]);

  useEffect(() => {
    if (datesTouched) return;
    const defaults = getDefaultTermDates(termCode, academicYear);
    if (!defaults) return;
    setStartDate(defaults.start);
    setEndDate(defaults.end);
  }, [termCode, academicYear, datesTouched]);

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
                type="number"
                inputMode="numeric"
                step={1}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026"
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester-termCode">Term</Label>
              <NativeSelect
                id="semester-termCode"
                name="termCode"
                value={termCode}
                onChange={(e) => setTermCode(e.target.value as TermCode)}
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
                value={startDate}
                onChange={(e) => {
                  setDatesTouched(true);
                  setStartDate(e.target.value);
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester-endDate">End date</Label>
              <Input
                id="semester-endDate"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setDatesTouched(true);
                  setEndDate(e.target.value);
                }}
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
