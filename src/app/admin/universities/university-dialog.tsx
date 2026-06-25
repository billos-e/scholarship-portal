"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  createUniversity,
  updateUniversity,
} from "@/lib/actions/universities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type University = {
  id: string;
  name: string;
  hasSummerSemester: boolean;
  isActive: boolean;
  notes: string | null;
};

export function UniversityDialog({ university }: { university?: University }) {
  const isEdit = Boolean(university);
  const action = isEdit ? updateUniversity : createUniversity;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      toast.success(isEdit ? "University updated." : "University created.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon-sm" aria-label="Edit" />
          ) : (
            <Button />
          )
        }
      >
        {isEdit ? (
          <Pencil />
        ) : (
          <>
            <Plus /> New University
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit university" : "Add university"}
          </DialogTitle>
          <DialogDescription>
            Partner universities used across student profiles.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          {isEdit ? (
            <input type="hidden" name="id" value={university!.id} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={university?.name}
              placeholder="Chulalongkorn University"
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="hasSummerSemester">Has summer semester</Label>
              <p className="text-xs text-muted-foreground">
                Whether this university runs a summer term.
              </p>
            </div>
            <Switch
              id="hasSummerSemester"
              name="hasSummerSemester"
              defaultChecked={university?.hasSummerSemester ?? true}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="isActive">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive universities are hidden from new selections.
              </p>
            </div>
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={university?.isActive ?? true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={university?.notes ?? ""}
              rows={2}
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
