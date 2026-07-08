"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProfileInfoCard } from "@/components/admin/profile-info-card";
import { StudentAcademicFields } from "@/components/admin/student-academic-fields";
import {
  type ActionState,
  saveOwnProfileEdit,
  uploadOwnPhoto,
} from "@/lib/actions/profile";
import { getInitials } from "@/lib/initials";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UniversityOption = { id: string; name: string };

export type StudentProfileEditData = {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string | null;
  phone: string | null;
  universityId: string | null;
  degreeProgram: string | null;
  yearOfStudy: string | null;
  currentSemesterLabel: string | null;
  gpa: string | null;
  photoUrl: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
};

function StudentPhotoSection({
  photoUrl,
  fullName,
  initials,
  onUploaded,
}: {
  photoUrl: string | null;
  fullName: string;
  initials: string;
  onUploaded: (url: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadState, uploadAction, uploading] = useActionState<ActionState, FormData>(
    uploadOwnPhoto,
    {},
  );

  const displayUrl = previewUrl ?? (photoUrl?.trim() ? uploadPublicUrl(photoUrl) : null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (uploadState.success && previewUrl) {
      toast.success("Photo updated.");
      onUploaded(previewUrl);
    }
    if (uploadState.error) toast.error(uploadState.error);
  }, [uploadState]);

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card px-4 py-5 shadow-sm sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className={cn(
            "relative size-24 shrink-0 overflow-hidden rounded-full sm:size-28",
            !displayUrl &&
              "flex items-center justify-center bg-primary text-3xl font-bold text-primary-foreground",
          )}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
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

        <form action={uploadAction} className="min-w-0 flex-1 space-y-2">
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
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(URL.createObjectURL(file));
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Max 10 MB.
          </p>
          <Button type="submit" size="sm" variant="outline" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload photo"}
          </Button>
        </form>
      </div>
    </section>
  );
}

export function StudentProfileEditForm({
  student,
  universities,
  academicOptions,
  profileHref,
  onSuccess,
}: {
  student: StudentProfileEditData;
  universities: UniversityOption[];
  academicOptions: StudentAcademicOptions;
  profileHref: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const fullName = `${student.firstName} ${student.lastName}`;
  const initials = getInitials(fullName);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(student.photoUrl);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    saveOwnProfileEdit,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Profile updated.");
      onSuccess?.();
      router.push(profileHref);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <StudentPhotoSection
        photoUrl={currentPhotoUrl}
        fullName={fullName}
        initials={initials}
        onUploaded={setCurrentPhotoUrl}
      />

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          formAction(new FormData(e.currentTarget));
        }}
        className="space-y-6"
      >
        <ProfileInfoCard title="Personal information">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                defaultValue={student.firstName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                required
                defaultValue={student.lastName}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                Student ID
                <Lock className="size-3 text-muted-foreground/60" />
              </Label>
              <div className="flex h-9 items-center rounded-lg border border-border/60 bg-muted/40 px-3 text-sm text-muted-foreground">
                {student.studentId ?? <span className="italic opacity-60">Not set</span>}
              </div>
              <input type="hidden" name="studentId" value={student.studentId ?? ""} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                Email address
                <Lock className="size-3 text-muted-foreground/60" />
              </Label>
              <div className="flex h-9 items-center rounded-lg border border-border/60 bg-muted/40 px-3 text-sm text-muted-foreground">
                {student.email}
              </div>
              <input type="hidden" name="email" value={student.email} />
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

        {state.error ? (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
