"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  updateRequestAdminNotes,
  type RequestActionState,
} from "@/lib/actions/requests";
import { cn } from "@/lib/utils";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

type AdminNotesCommentProps = {
  requestId: string;
  value: string;
  className?: string;
  onSuccess?: () => void;
};

export function AdminNotesComment({
  requestId,
  value,
  className,
  onSuccess,
}: AdminNotesCommentProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState<RequestActionState, FormData>(
    updateRequestAdminNotes,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Notes saved.");
      setEditing(false);
      onSuccess?.();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  const hasNotes = value.trim().length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-fuchsia-light text-primary">
          <Lock className="size-4" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold">Internal notes</p>
          <p className="text-xs text-muted-foreground">
            Only visible to the scholarship team
          </p>
        </div>
      </div>

      {editing ? (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="requestId" value={requestId} />
          <Textarea
            name="adminNotes"
            defaultValue={value}
            rows={4}
            placeholder="Add private notes about this request..."
            className="resize-none bg-background/80"
            autoFocus
          />
          <div className="flex gap-2">
            <SaveButton />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="group relative rounded-xl border border-border/60 bg-muted/20 p-4">
          {hasNotes ? (
            <p className="whitespace-pre-wrap pr-8 text-sm leading-relaxed text-foreground">
              {value}
            </p>
          ) : (
            <p className="pr-8 text-sm italic text-muted-foreground">
              No internal notes yet.
            </p>
          )}
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="absolute right-2 top-2 opacity-60 transition-opacity hover:opacity-100"
            onClick={() => setEditing(true)}
            aria-label={hasNotes ? "Edit internal notes" : "Add internal notes"}
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
