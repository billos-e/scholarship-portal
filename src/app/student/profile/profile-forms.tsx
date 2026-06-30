"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { StudentAcademicFields } from "@/components/admin/student-academic-fields";
import {
  type ActionState,
  updateOwnBank,
  updateOwnProfile,
} from "@/lib/actions/profile";
import type { StudentAcademicOptions } from "@/lib/student-academic-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export type StudentProfileValues = {
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
};

type UniversityOption = { id: string; name: string };

export function StudentProfileForm({
  profile,
  universities,
  academicOptions,
}: {
  profile: StudentProfileValues;
  universities: UniversityOption[];
  academicOptions: StudentAcademicOptions;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateOwnProfile,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Profile updated.");
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            required
            defaultValue={profile.firstName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            required
            defaultValue={profile.lastName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={profile.email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID</Label>
          <Input
            id="studentId"
            name="studentId"
            defaultValue={profile.studentId ?? ""}
            placeholder="e.g. STU-20481"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
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
            defaultValue={profile.gpa ?? ""}
          />
        </div>

        <StudentAcademicFields
          idPrefix="profile"
          universities={universities}
          academicOptions={academicOptions}
          defaultUniversityId={profile.universityId}
          defaultDegreeProgram={profile.degreeProgram}
          defaultSemesterLabel={profile.currentSemesterLabel}
          defaultYearOfStudy={profile.yearOfStudy}
        />
      </div>

      {state.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <SubmitButton label="Save profile" />
    </form>
  );
}

export type BankValues = {
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
};

export function BankForm({ bank }: { bank: BankValues }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateOwnBank,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Bank information updated.");
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bankAccountName">Account name</Label>
          <Input
            id="bankAccountName"
            name="bankAccountName"
            defaultValue={bank.bankAccountName ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankAccountNumber">Account number</Label>
          <Input
            id="bankAccountNumber"
            name="bankAccountNumber"
            defaultValue={bank.bankAccountNumber ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank name</Label>
          <Input id="bankName" name="bankName" defaultValue={bank.bankName ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promptpayNumber">PromptPay number</Label>
          <Input
            id="promptpayNumber"
            name="promptpayNumber"
            defaultValue={bank.promptpayNumber ?? ""}
          />
        </div>
      </div>
      {state.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <SubmitButton label="Save bank info" />
    </form>
  );
}
