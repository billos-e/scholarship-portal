"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { type ActionState, updateStudent } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

type UniversityOption = { id: string; name: string };

export type StudentEditData = {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string | null;
  phone: string | null;
  universityId: string | null;
  degreeProgram: string | null;
  yearOfStudy: string | null;
  currentSemesterLabel: string | null;
  gpa: string | null;
  status: "ACTIVE" | "GRADUATED" | "INACTIVE";
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function StudentEditForm({
  student,
  universities,
}: {
  student: StudentEditData;
  universities: UniversityOption[];
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateStudent,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Student profile updated.");
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={student.id} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" defaultValue={student.firstName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" defaultValue={student.lastName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID</Label>
          <Input id="studentId" name="studentId" defaultValue={student.studentId ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={student.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="universityId">University</Label>
          <NativeSelect
            id="universityId"
            name="universityId"
            defaultValue={student.universityId ?? ""}
          >
            <option value="">— None —</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="degreeProgram">Degree program</Label>
          <Input
            id="degreeProgram"
            name="degreeProgram"
            defaultValue={student.degreeProgram ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearOfStudy">Year of study</Label>
          <Input
            id="yearOfStudy"
            name="yearOfStudy"
            defaultValue={student.yearOfStudy ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentSemesterLabel">Current semester</Label>
          <Input
            id="currentSemesterLabel"
            name="currentSemesterLabel"
            defaultValue={student.currentSemesterLabel ?? ""}
            placeholder="Fall 2026"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gpa">GPA</Label>
          <Input
            id="gpa"
            name="gpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            defaultValue={student.gpa ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <NativeSelect id="status" name="status" defaultValue={student.status}>
            <option value="ACTIVE">Active</option>
            <option value="GRADUATED">Graduated</option>
            <option value="INACTIVE">Inactive</option>
          </NativeSelect>
          <p className="text-xs text-muted-foreground">
            Only active students can sign in. Graduated/inactive accounts keep
            their history.
          </p>
        </div>
      </div>

      {state.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
