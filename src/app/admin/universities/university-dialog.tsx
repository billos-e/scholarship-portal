"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  type ActionState,
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function UniversityDialog({ university }: { university?: University }) {
  const isEdit = Boolean(university);
  const action = isEdit ? updateUniversity : createUniversity;
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? "University updated." : "University created.");
      setOpen(false);
    }
  }, [state.success, isEdit]);

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

        <form action={formAction} className="space-y-4">
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

          {state.error ? (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter showCloseButton>
            <SubmitButton label={isEdit ? "Save changes" : "Create"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
