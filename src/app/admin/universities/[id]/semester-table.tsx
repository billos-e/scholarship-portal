"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { TermCode } from "@prisma/client";

import {
  deleteUniversitySemester,
  toggleUniversitySemesterActive,
} from "@/lib/actions/universities";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

type SemesterRow = {
  id: string;
  label: string;
  academicYear: string;
  termCode: TermCode;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export function SemesterTable({
  semesters,
  universityId,
}: {
  semesters: SemesterRow[];
  universityId: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      try {
        await toggleUniversitySemesterActive(id, universityId, isActive);
        toast.success(isActive ? "Semester activated." : "Semester deactivated.");
      } catch {
        toast.error("Could not update semester.");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteUniversitySemester(id, universityId);
        toast.success("Semester deleted.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not delete semester.",
        );
      }
    });
  }

  if (semesters.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No semesters configured yet.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Label</TableHead>
          <TableHead>Term</TableHead>
          <TableHead>Academic year</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {semesters.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">{s.label}</TableCell>
            <TableCell>{s.termCode}</TableCell>
            <TableCell>{s.academicYear}</TableCell>
            <TableCell>{formatDate(s.startDate)}</TableCell>
            <TableCell>{formatDate(s.endDate)}</TableCell>
            <TableCell>
              <Switch
                checked={s.isActive}
                disabled={pending}
                onCheckedChange={(checked) => handleToggle(s.id, checked)}
              />
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => handleDelete(s.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
