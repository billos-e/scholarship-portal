"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
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

type ColumnId = "active" | "inactive";

function ProgramTile({
  program,
  pending,
  onEdit,
  onDeleteRequest,
  onDragStart,
  onDragEnd,
}: {
  program: ProgramRow;
  pending: boolean;
  onEdit: (program: ProgramRow) => void;
  onDeleteRequest: (program: ProgramRow) => void;
  onDragStart: (programId: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable={!pending}
      onDragStart={(event) => {
        onDragStart(program.id);
        event.dataTransfer.setData("text/plain", program.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(program)}
      className={cn(
        "group relative inline-flex max-w-full cursor-grab items-center rounded-full border border-border/80 bg-background px-4 py-2 pr-8 text-sm font-medium shadow-sm transition-all",
        "hover:border-primary/35 hover:bg-primary/[0.03] hover:shadow-md",
        "active:cursor-grabbing",
        pending && "pointer-events-none opacity-60",
      )}
    >
      <span className="truncate">{program.name}</span>
      {program.canDelete ? (
        <button
          type="button"
          aria-label={`Delete ${program.name}`}
          className={cn(
            "absolute top-1 right-1 flex size-5 items-center justify-center rounded-full",
            "bg-muted/90 text-muted-foreground opacity-0 transition-opacity",
            "hover:bg-destructive/10 hover:text-destructive",
            "group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onDeleteRequest(program);
          }}
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

function ProgramColumn({
  columnId,
  title,
  description,
  programs,
  pending,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onEdit,
  onDeleteRequest,
  onDragStart,
  onDragEnd,
}: {
  columnId: ColumnId;
  title: string;
  description: string;
  programs: ProgramRow[];
  pending: boolean;
  dragOver: boolean;
  onDragOver: (columnId: ColumnId) => void;
  onDragLeave: () => void;
  onDrop: (columnId: ColumnId) => void;
  onEdit: (program: ProgramRow) => void;
  onDeleteRequest: (program: ProgramRow) => void;
  onDragStart: (programId: string) => void;
  onDragEnd: () => void;
}) {
  const isActive = columnId === "active";

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver(columnId);
      }}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(columnId);
      }}
      className={cn(
        "flex min-h-56 flex-col rounded-2xl border border-dashed p-4 transition-colors",
        isActive
          ? "border-primary/25 bg-primary/[0.03]"
          : "border-border/70 bg-muted/20",
        dragOver &&
          (isActive
            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
            : "border-muted-foreground/40 bg-muted/35 ring-2 ring-muted-foreground/15"),
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span
          className={cn(
            "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
            isActive
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {programs.length}
        </span>
      </header>

      <div className="flex flex-1 flex-wrap content-start gap-2">
        {programs.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {isActive
              ? "Drag programs here to make them available to students."
              : "Drag programs here to hide them from student selection."}
          </p>
        ) : (
          programs.map((program) => (
            <ProgramTile
              key={program.id}
              program={program}
              pending={pending}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function ProgramBoard({
  programs,
  universityId,
  onSuccess,
}: {
  programs: ProgramRow[];
  universityId: string;
  onSuccess?: () => void;
}) {
  const [items, setItems] = useState(programs);
  const [pending, startTransition] = useTransition();
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramEditValues | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<ProgramRow | null>(null);

  useEffect(() => {
    setItems(programs);
  }, [programs]);

  const activePrograms = items
    .filter((program) => program.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
  const inactivePrograms = items
    .filter((program) => !program.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));

  function openCreate() {
    setEditingProgram(null);
    setDialogOpen(true);
  }

  function openEdit(program: ProgramRow) {
    setEditingProgram({
      id: program.id,
      name: program.name,
      isActive: program.isActive,
    });
    setDialogOpen(true);
  }

  function moveProgram(programId: string, targetActive: boolean) {
    const program = items.find((item) => item.id === programId);
    if (!program || program.isActive === targetActive) return;

    const previous = items;
    setItems((current) =>
      current.map((item) =>
        item.id === programId ? { ...item, isActive: targetActive } : item,
      ),
    );

    startTransition(async () => {
      try {
        await toggleUniversityDegreeProgramActive(
          programId,
          universityId,
          targetActive,
        );
        toast.success(
          targetActive ? "Program activated." : "Program deactivated.",
        );
        onSuccess?.();
      } catch {
        setItems(previous);
        toast.error("Could not move program.");
      }
    });
  }

  function handleColumnDrop(targetColumn: ColumnId) {
    setDragOverColumn(null);
    if (!draggedId) return;
    moveProgram(draggedId, targetColumn === "active");
    setDraggedId(null);
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
        toast.error(
          err instanceof Error ? err.message : "Could not delete program.",
        );
      }
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="size-3.5" />
          Add program
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          No degree programs configured yet. Add programs so students can select
          them on their profile.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <ProgramColumn
            columnId="active"
            title="Active"
            description="Visible to students on their profile."
            programs={activePrograms}
            pending={pending}
            dragOver={dragOverColumn === "active"}
            onDragOver={setDragOverColumn}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={handleColumnDrop}
            onEdit={openEdit}
            onDeleteRequest={setDeleteTarget}
            onDragStart={setDraggedId}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverColumn(null);
            }}
          />
          <ProgramColumn
            columnId="inactive"
            title="Inactive"
            description="Hidden from student selection."
            programs={inactivePrograms}
            pending={pending}
            dragOver={dragOverColumn === "inactive"}
            onDragOver={setDragOverColumn}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={handleColumnDrop}
            onEdit={openEdit}
            onDeleteRequest={setDeleteTarget}
            onDragStart={setDraggedId}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverColumn(null);
            }}
          />
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
                ? `“${deleteTarget.name}” will be permanently removed. This cannot be undone.`
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
}
