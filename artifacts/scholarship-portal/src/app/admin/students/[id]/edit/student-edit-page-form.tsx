"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProfileInfoCard } from "@/components/admin/profile-info-card";
import { StudentAcademicFields } from "@/components/admin/student-academic-fields";
import { EthnicityChipSelect } from "@/components/ethnicity-chip-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  type ActionState,
  saveStudentEdit,
} from "@/lib/actions/students";
import { graduationYearOptions } from "@/lib/graduation-year";
import { RELIGION_LABELS, RELIGIONS } from "@/lib/religion";
import {
  SCHOLARSHIP_TYPE_LABELS,
  SCHOLARSHIP_TYPES,
} from "@/lib/scholarship-type";
import { getInitials } from "@/lib/initials";
import { generateSecurePassword } from "@/lib/password";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";
import {
  readStudentProfileFromFormData,
  validateStudentProfileEdit,
} from "@/lib/validations/student-profile";
import { hasAnyBankField, type BankAccountFields } from "@/lib/bank-accounts";

type UniversityOption = { id: string; name: string };

export type StudentEditPageData = {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string | null;
  phone: string | null;
  ethnicity: string[] | null;
  scholarshipType: string | null;
  graduationYear: number | null;
  religion: string | null;
  universityId: string | null;
  degreeProgram: string | null;
  yearOfStudy: string | null;
  currentSemesterLabel: string | null;
  gpa: string | null;
  status: "ACTIVE" | "GRADUATED" | "INACTIVE";
  photoUrl: string | null;
  bankAccounts: BankAccountFields[];
};

export function StudentEditPageForm({
  student,
  universities,
  academicOptions,
  onSuccess,
}: {
  student: StudentEditPageData;
  universities: UniversityOption[];
  academicOptions: StudentAcademicOptions;
  onSuccess?: () => void;
}) {
  const fullName = `${student.firstName} ${student.lastName}`;

  const router = useRouter();
  const initials = getInitials(fullName);
  const [password, setPassword] = useState("");
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const displayPhotoUrl = previewPhotoUrl ?? (student.photoUrl ? uploadPublicUrl(student.photoUrl) : null);
  const formRef = useRef<HTMLFormElement>(null);
  const account1 = student.bankAccounts[0];
  const account2 = student.bankAccounts[1];
  const [showSecondAccount, setShowSecondAccount] = useState(
    () => Boolean(account2 && hasAnyBankField(account2)),
  );

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
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
      onSuccess?.();
      router.push(`/admin/students/${student.id}`);
    }
  }, [state]);

  useEffect(() => {
    return () => {
      if (previewPhotoUrl) URL.revokeObjectURL(previewPhotoUrl);
    };
  }, [previewPhotoUrl]);

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
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        formAction(new FormData(e.currentTarget));
      }}
      className="space-y-6"
    >
      <input type="hidden" name="id" value={student.id} />
      <input type="hidden" name="userId" value={student.userId} />
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card px-6 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className={cn(
              "relative size-24 shrink-0 overflow-hidden rounded-full sm:size-28",
              !displayPhotoUrl &&
                "flex items-center justify-center bg-primary text-3xl font-bold text-primary-foreground",
            )}
          >
            {displayPhotoUrl ? (
              <Image
                src={displayPhotoUrl}
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (previewPhotoUrl) URL.revokeObjectURL(previewPhotoUrl);
                  setPreviewPhotoUrl(URL.createObjectURL(file));
                }
              }}
            />
            <p className="text-xs text-muted-foreground">Leave unchanged to keep the current photo.</p>
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
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={student.phone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="religion">Religion</Label>
              <NativeSelect
                id="religion"
                name="religion"
                defaultValue={student.religion ?? ""}
              >
                <option value="">— Not specified —</option>
                {RELIGIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {RELIGION_LABELS[opt]}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Ethnicity</Label>
              <EthnicityChipSelect defaultSelected={student.ethnicity ?? []} />
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
          <div className="space-y-2">
            <Label htmlFor="scholarshipType">Scholarship type</Label>
            <NativeSelect
              id="scholarshipType"
              name="scholarshipType"
              defaultValue={student.scholarshipType ?? ""}
            >
              <option value="">— Not specified —</option>
              {SCHOLARSHIP_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {SCHOLARSHIP_TYPE_LABELS[opt]}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduationYear">Graduation year</Label>
            <NativeSelect
              id="graduationYear"
              name="graduationYear"
              defaultValue={
                student.graduationYear != null ? String(student.graduationYear) : ""
              }
            >
              <option value="">— Not specified —</option>
              {graduationYearOptions(student.graduationYear).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
      </ProfileInfoCard>
      <ProfileInfoCard title="Bank information">
        <input type="hidden" name="bankAccountId" value={account1?.id ?? ""} />
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank name</Label>
            <Input
              id="bankName"
              name="bankName"
              defaultValue={account1?.bankName ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccountName">Account holder</Label>
            <Input
              id="bankAccountName"
              name="bankAccountName"
              defaultValue={account1?.bankAccountName ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber">Account number</Label>
            <Input
              id="bankAccountNumber"
              name="bankAccountNumber"
              defaultValue={account1?.bankAccountNumber ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promptpayNumber">PromptPay</Label>
            <Input
              id="promptpayNumber"
              name="promptpayNumber"
              defaultValue={account1?.promptpayNumber ?? ""}
            />
          </div>
        </div>
      </ProfileInfoCard>
      {showSecondAccount ? (
        <ProfileInfoCard
          title="Second bank account"
          headerAction={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setShowSecondAccount(false)}
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          }
        >
          <input type="hidden" name="includeBankAccount2" value="1" />
          <input type="hidden" name="bankAccountId2" value={account2?.id ?? ""} />
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bankName2">Bank name</Label>
              <Input
                id="bankName2"
                name="bankName2"
                defaultValue={account2?.bankName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccountName2">Account holder</Label>
              <Input
                id="bankAccountName2"
                name="bankAccountName2"
                defaultValue={account2?.bankAccountName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccountNumber2">Account number</Label>
              <Input
                id="bankAccountNumber2"
                name="bankAccountNumber2"
                defaultValue={account2?.bankAccountNumber ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promptpayNumber2">PromptPay</Label>
              <Input
                id="promptpayNumber2"
                name="promptpayNumber2"
                defaultValue={account2?.promptpayNumber ?? ""}
              />
            </div>
          </div>
        </ProfileInfoCard>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSecondAccount(true)}
        >
          <Plus className="size-3.5" />
          Add a second bank account
        </Button>
      )}
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
      {state.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
