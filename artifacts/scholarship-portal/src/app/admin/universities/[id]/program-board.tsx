"use client";

import React, { useEffect, useImperativeHandle, useState, useTransition } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteUniversityDegreeProgram,
  toggleUniversityDegreeProgramActive,
} from "@/lib/actions/universities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ProgramEditDialog,
  type ProgramEditValues,
} from "./program-edit-dialog";

export type ProgramRow = {
  id: string;
  name: string;
  isActive: boolean;
  canDelete: boolean;
};

function ProgramChip({
  program,
  pending,
  onEdit,
  onDeleteRequest,
  onToggleActive,
}: {
  program: ProgramRow;
  pending: boolean;
  onEdit: (program: ProgramRow) => void;
  onDeleteRequest: (program: ProgramRow) => void;
  onToggleActive: (program: ProgramRow) => void;
}) {
  const editBtn = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(program);
      }}
      className={cn(
        "flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors",
        "hover:bg-primary/10 hover:text-primary",
      )}
    >
      <Pencil className="size-3" />
    </button>
  );

  const deleteBtn = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDeleteRequest(program);
      }}
      className={cn(
        "flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors",
        "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      <Trash2 className="size-3" />
    </button>
  );

  const toggleBtn = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggleActive(program);
      }}
      className={cn(
        "flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors",
        program.isActive
          ? "hover:bg-amber-500/10 hover:text-amber-600"
          : "hover:bg-emerald-500/10 hover:text-emerald-600",
      )}
    >
      {program.isActive ? (
        <EyeOff className="size-3" />
      ) : (
        <Eye className="size-3" />
      )}
    </button>
  );

  return (
    <div
      className={cn(
        "group/chip relative inline-flex items-center justify-center rounded-full border border-border/80 bg-background text-sm font-medium shadow-sm transition-all",
        "hover:border-primary/35 hover:bg-primary/[0.03] hover:shadow-md",
        !program.isActive && "opacity-50 blur-[0.5px] hover:opacity-100 hover:blur-none",
        pending && "pointer-events-none opacity-40",
        "min-w-[8rem]",
      )}
    >
      {/* Text — blurs on hover so icons sit on top */}
      <span className="truncate px-4 py-1.5 transition-[filter] duration-200 group-hover/chip:blur-sm">
        {program.name}
      </span>

      {/* Icon overlay — centered on the chip */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/chip:opacity-100">
        <div className="flex items-center gap-1 px-2 py-1">
          <Tooltip>
            <TooltipTrigger render={editBtn} />
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          {program.canDelete ? (
            <Tooltip>
              <TooltipTrigger render={deleteBtn} />
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          ) : null}

          <Tooltip>
            <TooltipTrigger render={toggleBtn} />
            <TooltipContent>
              {program.isActive ? "Deactivate" : "Activate"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export interface ProgramBoardHandle {
  openCreate: () => void;
}

interface ProgramBoardProps {
  programs: ProgramRow[];
  universityId: string;
  onSuccess?: () => void;
}

export const ProgramBoard = React.forwardRef<ProgramBoardHandle, ProgramBoardProps>(function ProgramBoard({
  programs,
  universityId,
  onSuccess,
}, ref) {
  const [items, setItems] = useState(programs);
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramEditValues | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProgramRow | null>(null);

  useEffect(() => {
    setItems(programs);
  }, [programs]);

  const sorted = [...items].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  useImperativeHandle(ref, () => ({
    openCreate: () => {
      setEditingProgram(null);
      setDialogOpen(true);
    },
  }));

  function openCreate() {
    setEditingProgram(null);
    setDialogOpen(true);
  }

  function openEdit(program: ProgramRow) {
    setEditingProgram({ id: program.id, name: program.name, isActive: program.isActive });
    setDialogOpen(true);
  }

  function toggleActive(program: ProgramRow) {
    const targetActive = !program.isActive;
    const previous = items;

    setItems((current) =>
      current.map((item) =>
        item.id === program.id ? { ...item, isActive: targetActive } : item,
      ),
    );

    startTransition(async () => {
      try {
        await toggleUniversityDegreeProgramActive(program.id, universityId, targetActive);
        toast.success(targetActive ? "Program activated." : "Program deactivated.");
        onSuccess?.();
      } catch {
        setItems(previous);
        toast.error("Could not update program.");
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    startTransition(async () => {
      try {
        await deleteUniversityDegreeProgram(target.id, universityId);
        toast.success("Program deleted.");
        onSuccess?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete program.");
      }
    });
  }

  return (
    <>
      {items.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          No degree programs configured yet. Add programs so students can select
          them on their profile.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sorted.map((program) => (
            <ProgramChip
              key={program.id}
              program={program}
              pending={pending}
              onEdit={openEdit}
              onDeleteRequest={setDeleteTarget}
              onToggleActive={toggleActive}
            />
          ))}
        </div>
      )}

      <ProgramEditDialog
        universityId={universityId}
        program={editingProgram}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onSuccess}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete program?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
