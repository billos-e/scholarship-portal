"use client";

import { useState, useTransition } from "react";
import {
  ChevronDown,
  KeyRound,
  Mail,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { StudentAcademicFields } from "@/components/admin/student-academic-fields";
import { CopyableValue } from "@/components/admin/copyable-value";
import { createStudent } from "@/lib/actions/students";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";
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
import {
  readStudentProfileFromFormData,
  validateStudentProfileCreate,
} from "@/lib/validations/student-profile";
import { cn } from "@/lib/utils";

type UniversityOption = { id: string; name: string };

export function StudentCreateDialog({
  universities,
  academicOptions,
}: {
  universities: UniversityOption[];
  academicOptions: StudentAcademicOptions;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [universityId, setUniversityId] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [autoStudentId, setAutoStudentId] = useState("");

  function generateStudentId() {
    const year = new Date().getFullYear();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `STU-${year}-${String(num).padStart(4, "0")}`;
  }

  function resetState() {
    setError(undefined);
    setGeneratedPassword(null);
    setUniversityId("");
    setDetailsOpen(false);
    setAutoStudentId("");
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setAutoStudentId(generateStudentId());
    } else {
      resetState();
    }
  }

  function onUniversityChange(nextId: string) {
    setUniversityId(nextId);
  }

  function onSubmit(formData: FormData) {
    const profileCheck = validateStudentProfileCreate(
      readStudentProfileFromFormData(formData),
    );
    if (!profileCheck.success) {
      setError(profileCheck.error);
      return;
    }

    startTransition(async () => {
      const result = await createStudent({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      if (result.generatedPassword) {
        setGeneratedPassword(result.generatedPassword);
        toast.success("Student account created.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <Plus /> New Student
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(92vh,900px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-4xl">
        {generatedPassword ? (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg">
                Account created
              </DialogTitle>
              <DialogDescription>
                Share this one-time password with the student securely. It will
                not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 rounded-xl border border-border/70 bg-muted/25 px-4 py-4">
              <CopyableValue
                label="Temporary password"
                value={generatedPassword}
                mono
              />
            </div>
            <DialogFooter showCloseButton className="mt-6 border-0 bg-transparent p-0">
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="relative border-b border-border/60 bg-gradient-to-br from-brand-fuchsia-light/40 via-background to-brand-orange-light/25 px-6 pb-5 pt-6">
              <div
                className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl"
                aria-hidden
              />
              <DialogHeader className="relative text-left">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
                  Add student
                </DialogTitle>
                <DialogDescription className="max-w-sm text-sm leading-relaxed">
                  Create a portal login with email and university. Names and
                  academic details can be filled in now or later.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form action={onSubmit} className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div
                className={cn(
                  "min-w-0",
                  detailsOpen &&
                    "max-h-[min(52vh,480px)] overflow-x-hidden overflow-y-auto",
                )}
              >
              <div className="space-y-6 px-6 py-5">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <KeyRound className="size-3.5" />
                    Required
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0 space-y-2 sm:col-span-2">
                      <Label htmlFor="email" className="flex items-center gap-1.5">
                        <Mail className="size-3.5 text-muted-foreground" />
                        Email address
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="student@university.edu"
                        autoComplete="off"
                        required
                        className="h-10"
                      />
                    </div>

                    <StudentAcademicFields
                      idPrefix="create"
                      universities={universities}
                      academicOptions={academicOptions}
                      universityRequired
                      showUniversity
                      showProgram={false}
                      showSemester={false}
                      universityId={universityId}
                      onUniversityChange={onUniversityChange}
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <UserRound className="size-3.5" />
                    Optional
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Optional"
                        autoComplete="off"
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Optional"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </section>

                <input type="hidden" name="status" value="ACTIVE" />

                {error ? (
                  <p
                    className={cn(
                      "rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2",
                      "text-sm font-medium text-destructive",
                    )}
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
              </div>

              <details
                className="group border-t border-border/60"
                onToggle={(event) =>
                  setDetailsOpen(event.currentTarget.open)
                }
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-3.5 text-sm font-medium transition-colors hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
                  <span>Additional profile details</span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="min-w-0 space-y-4 border-t border-border/60 px-6 py-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Student ID, contact, program, semester, and GPA. Leave blank
                    to add later from the student profile.
                  </p>
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        name="studentId"
                        value={autoStudentId}
                        onChange={(e) => setAutoStudentId(e.target.value)}
                        placeholder="e.g. STU-2026-1234"
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" type="tel" />
                    </div>
                    <StudentAcademicFields
                      idPrefix="create-extra"
                      universities={universities}
                      academicOptions={academicOptions}
                      showUniversity={false}
                      universityId={universityId}
                      onUniversityChange={onUniversityChange}
                    />
                    <div className="min-w-0 space-y-2 sm:col-span-2">
                      <Label htmlFor="gpa">GPA</Label>
                      <Input
                        id="gpa"
                        name="gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        placeholder="0.00 – 4.00"
                        className="max-w-xs"
                      />
                    </div>
                  </div>
                </div>
              </details>
              </div>

              <DialogFooter className="-mx-0 -mb-0 shrink-0 flex-col gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 sm:flex-row sm:items-center">
                <p className="mr-auto text-xs text-muted-foreground">
                  A secure temporary password is generated automatically.
                </p>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating…" : "Create student"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
