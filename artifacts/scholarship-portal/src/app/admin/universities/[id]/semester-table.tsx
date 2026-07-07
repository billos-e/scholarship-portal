"use client";

import React, { useEffect, useImperativeHandle, useState, useTransition } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TermCode } from "@/shims/prisma-client";

import {
  deleteUniversitySemester,
  toggleUniversitySemesterActive,
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
  SemesterEditDialog,
  type SemesterEditValues,
} from "./semester-edit-dialog";

type SemesterRow = {
  id: string;
  label: string;
  academicYear: string;
  termCode: string;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  canDelete: boolean;
};

function SemesterChip({
  semester,
  pending,
  onEdit,
  onDeleteRequest,
  onToggleActive,
}: {
  semester: SemesterRow;
  pending: boolean;
  onEdit: (semester: SemesterRow) => void;
  onDeleteRequest: (semester: SemesterRow) => void;
  onToggleActive: (semester: SemesterRow) => void;
}) {
  const editBtn = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(semester);
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
        onDeleteRequest(semester);
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
        onToggleActive(semester);
      }}
      className={cn(
        "flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors",
        semester.isActive
          ? "hover:bg-amber-500/10 hover:text-amber-600"
          : "hover:bg-emerald-500/10 hover:text-emerald-600",
      )}
    >
      {semester.isActive ? (
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
        !semester.isActive && "opacity-50 blur-[0.5px] hover:opacity-100 hover:blur-none",
        pending && "pointer-events-none opacity-40",
        "min-w-[8rem]",
      )}
    >
      <span className="truncate px-4 py-1.5 transition-[filter] duration-200 group-hover/chip:blur-sm">
        {semester.label}
      </span>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/chip:opacity-100">
        <div className="flex items-center gap-1 px-2 py-1">
          <Tooltip>
            <TooltipTrigger render={editBtn} />
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          {semester.canDelete ? (
            <Tooltip>
              <TooltipTrigger render={deleteBtn} />
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          ) : null}

          <Tooltip>
            <TooltipTrigger render={toggleBtn} />
            <TooltipContent>
              {semester.isActive ? "Deactivate" : "Activate"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export interface SemesterTableHandle {
  openCreate: () => void;
}

interface SemesterTableProps {
  semesters: SemesterRow[];
  universityId: string;
  onSuccess?: () => void;
}

export const SemesterTable = React.forwardRef<SemesterTableHandle, SemesterTableProps>(
  function SemesterTable({ semesters, universityId, onSuccess }, ref) {
    const [items, setItems] = useState(semesters);
    const [pending, startTransition] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSemester, setEditingSemester] = useState<SemesterEditValues | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SemesterRow | null>(null);

    useEffect(() => {
      setItems(semesters);
    }, [semesters]);

    const sorted = [...items].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    useImperativeHandle(ref, () => ({
      openCreate: () => {
        setEditingSemester(null);
        setDialogOpen(true);
      },
    }));

    function openEdit(semester: SemesterRow) {
      setEditingSemester({
        id: semester.id,
        label: semester.label,
        academicYear: semester.academicYear,
        termCode: semester.termCode,
        startDate: semester.startDate,
        endDate: semester.endDate,
        isActive: semester.isActive,
      });
      setDialogOpen(true);
    }

    function toggleActive(semester: SemesterRow) {
      const targetActive = !semester.isActive;
      const previous = items;

      setItems((current) =>
        current.map((item) =>
          item.id === semester.id ? { ...item, isActive: targetActive } : item,
        ),
      );

      startTransition(async () => {
        try {
          await toggleUniversitySemesterActive(semester.id, universityId, targetActive);
          toast.success(targetActive ? "Semester activated." : "Semester deactivated.");
          onSuccess?.();
        } catch {
          setItems(previous);
          toast.error("Could not update semester.");
        }
      });
    }

    function confirmDelete() {
      if (!deleteTarget) return;
      const target = deleteTarget;
      setDeleteTarget(null);

      startTransition(async () => {
        try {
          await deleteUniversitySemester(target.id, universityId);
          toast.success("Semester deleted.");
          onSuccess?.();
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Could not delete semester.",
          );
        }
      });
    }

    return (
      <>
        {items.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No semesters configured yet. Add semesters so students can submit requests.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sorted.map((semester) => (
              <SemesterChip
                key={semester.id}
                semester={semester}
                pending={pending}
                onEdit={openEdit}
                onDeleteRequest={setDeleteTarget}
                onToggleActive={toggleActive}
              />
            ))}
          </div>
        )}

        <SemesterEditDialog
          universityId={universityId}
          semester={editingSemester}
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDialogOpen(false);
              setEditingSemester(null);
            } else {
              setDialogOpen(true);
            }
          }}
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
              <AlertDialogTitle>Delete semester?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget
                  ? `"${deleteTarget.label}" will be permanently removed. This cannot be undone.`
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
  },
);
