"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ProfileInfoCard } from "@/components/admin/profile-info-card";
import { StudentAcademicFields } from "@/components/admin/student-academic-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { type ActionState, saveStudentEdit } from "@/lib/actions/students";
import { getInitials } from "@/lib/initials";
import { generateSecurePassword } from "@/lib/password";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";
import {
  readStudentProfileFromFormData,
  validateStudentProfileEdit,
} from "@/lib/validations/student-profile";

type UniversityOption = { id: string; name: string };

export type StudentEditPageData = {
  id: string;
  userId: string;
  email: string;
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
  photoUrl: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-accent text-accent-foreground hover:bg-accent/90"
    >
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function StudentEditPageForm({
  student,
  universities,
  academicOptions,
  profileHref,
}: {
  student: StudentEditPageData;
  universities: UniversityOption[];
  academicOptions: StudentAcademicOptions;
  profileHref: string;
}) {
  const fullName = `${student.firstName} ${student.lastName}`;
  const initials = getInitials(fullName);
  const hasPhoto = Boolean(student.photoUrl?.trim());
  const [password, setPassword] = useState("");

  const [state, formAction] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const attempt = (prev?.submitAttempt ?? 0) + 1;
      const profileCheck = validateStudentProfileEdit(
        readStudentProfileFromFormData(formData),
      );
      if (!profileCheck.success) {
        return { error: profileCheck.error, submitAttempt: attempt };
      }
      return saveStudentEdit(prev, formData);
    },
    {},
  );

  useEffect(() => {
    if (state.error && state.submitAttempt) {
      toast.error(state.error);
    }
  }, [state.error, state.submitAttempt]);

  useEffect(() => {
    if (state.success) {
      toast.success("Student updated.");
      setPassword("");
    }
  }, [state.success]);

  async function handleGeneratePassword() {
    const next = generateSecurePassword();
    setPassword(next);
    try {
      await navigator.clipboard.writeText(next);
      toast.success("Password generated and copied.");
    } catch {
      toast.success("Password generated.");
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={student.id} />
      <input type="hidden" name="userId" value={student.userId} />

      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card px-6 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className={cn(
                "relative size-24 shrink-0 overflow-hidden rounded-full sm:size-28",
                !hasPhoto &&
                  "flex items-center justify-center bg-primary text-3xl font-bold text-primary-foreground",
              )}
            >
              {hasPhoto ? (
                <Image
                  src={uploadPublicUrl(student.photoUrl!)}
                  alt={`${fullName} profile photo`}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="photo" className="text-base font-semibold">
                Profile photo
              </Label>
              <Input
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, or WebP. Leave unchanged to keep the current photo.
              </p>
            </div>
          </div>

        </div>
      </section>

      <ProfileInfoCard title="Personal information">
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={student.firstName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={student.lastName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              name="studentId"
              defaultValue={student.studentId ?? ""}
              placeholder="e.g. STU-20481"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={student.phone ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Account status</Label>
            <NativeSelect
              id="status"
              name="status"
              defaultValue={student.status}
            >
              <option value="ACTIVE">Active</option>
              <option value="GRADUATED">Graduated</option>
              <option value="INACTIVE">Inactive</option>
            </NativeSelect>
            <p className="text-xs text-muted-foreground">
              Only active students can sign in.
            </p>
          </div>
        </div>
      </ProfileInfoCard>

      <ProfileInfoCard title="Academic information">
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <StudentAcademicFields
            idPrefix="edit"
            universities={universities}
            academicOptions={academicOptions}
            defaultUniversityId={student.universityId}
            defaultDegreeProgram={student.degreeProgram}
            defaultSemesterLabel={student.currentSemesterLabel}
            defaultYearOfStudy={student.yearOfStudy}
          />
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
        </div>
      </ProfileInfoCard>

      <ProfileInfoCard title="Bank information">
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank name</Label>
            <Input
              id="bankName"
              name="bankName"
              defaultValue={student.bankName ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccountName">Account holder</Label>
            <Input
              id="bankAccountName"
              name="bankAccountName"
              defaultValue={student.bankAccountName ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber">Account number</Label>
            <Input
              id="bankAccountNumber"
              name="bankAccountNumber"
              defaultValue={student.bankAccountNumber ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promptpayNumber">PromptPay</Label>
            <Input
              id="promptpayNumber"
              name="promptpayNumber"
              defaultValue={student.promptpayNumber ?? ""}
            />
          </div>
        </div>
      </ProfileInfoCard>

      <ProfileInfoCard title="Login credentials">
        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account email
            </p>
            <p className="mt-1 text-sm font-medium">{student.email}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New temporary password</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                name="password"
                type="text"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                className="font-mono"
                autoComplete="new-password"
                placeholder="Leave blank to keep current password"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={handleGeneratePassword}
              >
                <Sparkles />
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. Generate a secure password or enter one manually, then
              save to apply.
            </p>
          </div>
        </div>
      </ProfileInfoCard>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
