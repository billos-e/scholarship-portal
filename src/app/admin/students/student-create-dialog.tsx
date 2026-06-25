"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createStudent } from "@/lib/actions/students";
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
import { NativeSelect } from "@/components/ui/native-select";

type UniversityOption = { id: string; name: string };

export function StudentCreateDialog({
  universities,
}: {
  universities: UniversityOption[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createStudent({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      toast.success("Student account created.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> New Student
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create student account</DialogTitle>
          <DialogDescription>
            A login account and profile are created together. Share the
            temporary password with the student.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary password</Label>
              <Input id="password" name="password" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" name="studentId" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="universityId">University</Label>
              <NativeSelect id="universityId" name="universityId" defaultValue="">
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
              <Input id="degreeProgram" name="degreeProgram" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearOfStudy">Year of study</Label>
              <Input id="yearOfStudy" name="yearOfStudy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentSemesterLabel">Current semester</Label>
              <Input
                id="currentSemesterLabel"
                name="currentSemesterLabel"
                placeholder="Fall 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input id="gpa" name="gpa" type="number" step="0.01" min="0" max="4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <NativeSelect id="status" name="status" defaultValue="ACTIVE">
                <option value="ACTIVE">Active</option>
                <option value="GRADUATED">Graduated</option>
                <option value="INACTIVE">Inactive</option>
              </NativeSelect>
            </div>
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
