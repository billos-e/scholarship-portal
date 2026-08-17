"use client";

import Image from "next/image";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Camera, Plus, Trash2 } from "lucide-react";
import { useFormDraft } from "@/lib/use-form-draft";
import Link from "next/link";

import {
  type ActionState,
  saveOwnProfileEdit,
  uploadOwnPhoto,
} from "@/lib/actions/profile";
import { getInitials } from "@/lib/initials";
import type {
  SemesterOption,
  StudentAcademicOptions,
} from "@/lib/student-academic-options";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { EthnicityChipSelect } from "@/components/ethnicity-chip-select";
import { normalizeEthnicity } from "@/lib/ethnicity-options";
import { graduationYearOptions } from "@/lib/graduation-year";
import { RELIGION_LABELS, RELIGIONS } from "@/lib/religion";
import {
  SCHOLARSHIP_TYPE_LABELS,
  SCHOLARSHIP_TYPES,
} from "@/lib/scholarship-type";
import { hasAnyBankField, type BankAccountFields } from "@/lib/bank-accounts";

type UniversityOption = { id: string; name: string };

export type StudentProfileEditData = {
  firstName: string;
  lastName: string;
  email: string;
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
  photoUrl: string | null;
  bankAccounts: BankAccountFields[];
};

// ── Merge helpers (same logic as StudentAcademicFields) ───────────────────────

function mergeProgramOptions(programs: string[], current?: string | null) {
  if (!current?.trim()) return programs;
  const set = new Set(programs);
  set.add(current.trim());
  return [...set].sort((a, b) => a.localeCompare(b));
}

function mergeSemesterOptions(
  semesters: SemesterOption[],
  currentLabel?: string | null,
) {
  if (!currentLabel?.trim()) return semesters;
  if (semesters.some((s) => s.label === currentLabel)) return semesters;
  return [
    ...semesters,
    {
      id: `legacy-${currentLabel}`,
      label: currentLabel,
      academicYear: "",
      startDate: "",
      endDate: "",
    },
  ];
}

// ── Layout primitives ─────────────────────────────────────────────────────────

const LABEL_W = "w-44 shrink-0";

function Row({
  label,
  locked,
  align = "center",
  children,
}: {
  label: string;
  locked?: boolean;
  align?: "center" | "start";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex gap-5 border-b border-border/30 py-3 last:border-0",
        align === "start" ? "items-start" : "items-center",
        locked && "opacity-60",
      )}
    >
      <div className={`${LABEL_W} flex items-center gap-1.5 ${align === "start" ? "pt-1.5" : ""}`}>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {locked && <Lock className="size-2.5 text-muted-foreground/50" />}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function PairRow({
  label1,
  children1,
  label2,
  children2,
}: {
  label1: string;
  children1: React.ReactNode;
  label2: string;
  children2: React.ReactNode;
}) {
  return (
    <div className="flex items-center border-b border-border/30 py-3 last:border-0">
      <div className="flex flex-1 items-center gap-5">
        <div className={`${LABEL_W} text-xs font-medium text-muted-foreground`}>{label1}</div>
        <div className="flex-1 min-w-0">{children1}</div>
      </div>
      <div className="mx-5 h-6 w-px shrink-0 bg-border/40" />
      <div className="flex flex-1 items-center gap-5">
        <div className="w-36 shrink-0 text-xs font-medium text-muted-foreground">{label2}</div>
        <div className="flex-1 min-w-0">{children2}</div>
      </div>
    </div>
  );
}

function LockedValue({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-8 items-center rounded-md border border-dashed border-border/50 bg-muted/30 px-2.5 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function FieldInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className="h-8 rounded-md px-2.5 text-sm"
    />
  );
}

function FieldSelect(props: React.ComponentProps<typeof NativeSelect>) {
  return (
    <NativeSelect
      {...props}
      className="h-8 rounded-md px-2.5 text-sm"
    />
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
        {title}
      </p>
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card px-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}

// ── Photo section (separate upload form) ──────────────────────────────────────

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
    <Group title="Photo">
      <form
        action={uploadAction}
        className="flex items-center gap-6 py-4"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "relative size-14 overflow-hidden rounded-full",
              !displayUrl &&
                "flex items-center justify-center bg-primary text-base font-bold text-primary-foreground",
            )}
          >
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt={`${fullName} profile photo`}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            ) : (
              initials
            )}
          </div>
          <label
            htmlFor="photo"
            className="absolute -bottom-0.5 -right-0.5 flex size-6 cursor-pointer items-center justify-center rounded-full border border-card bg-accent text-accent-foreground shadow hover:bg-accent/90"
          >
            <Camera className="size-3" />
          </label>
        </div>

        {/* Controls */}
        <div className="flex flex-1 items-center gap-4">
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="flex-1 h-8 rounded-md text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(URL.createObjectURL(file));
              }
            }}
          />
          <p className="shrink-0 text-xs text-muted-foreground">
            Max 10 MB
          </p>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={uploading}
            className="shrink-0 h-8 rounded-md text-xs"
          >
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </form>
    </Group>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

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

  const { get: getDraft, save: saveDraft, onFormChange, clearDraft } = useFormDraft("draft:profile-edit");

  // Academic controlled state (mirrors StudentAcademicFields logic)
  const [universityId, setUniversityId] = useState(getDraft("universityId", student.universityId ?? ""));
  const [degreeProgram, setDegreeProgram] = useState(getDraft("degreeProgram", student.degreeProgram ?? ""));
  const [semesterLabel, setSemesterLabel] = useState(getDraft("currentSemesterLabel", student.currentSemesterLabel ?? ""));
  const [yearOfStudy, setYearOfStudy] = useState(getDraft("yearOfStudy", student.yearOfStudy ?? ""));
  const [ethnicities, setEthnicities] = useState<string[]>(() => {
    const draft = getDraft("__chips_ethnicity", "");
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as unknown;
        if (Array.isArray(parsed)) return normalizeEthnicity(parsed);
      } catch {
        /* keep stored profile */
      }
    }
    return normalizeEthnicity(student.ethnicity);
  });
  const graduationYears = useMemo(
    () => graduationYearOptions(student.graduationYear),
    [student.graduationYear],
  );
  const account1 = student.bankAccounts[0];
  const account2 = student.bankAccounts[1];
  const [showSecondAccount, setShowSecondAccount] = useState(
    () => Boolean(account2 && hasAnyBankField(account2)),
  );

  // Only keep the student's original program/semester selectable while the
  // originally-assigned university is still selected. Switching to a
  // different university must not carry over a value that doesn't belong
  // to that university's own catalog.
  const isOriginalUniversity = universityId === (student.universityId ?? "");

  const programs = useMemo(
    () =>
      universityId
        ? mergeProgramOptions(
            academicOptions.programsByUniversity[universityId] ?? [],
            isOriginalUniversity ? student.degreeProgram : null,
          )
        : [],
    [universityId, academicOptions.programsByUniversity, student.degreeProgram, isOriginalUniversity],
  );

  const semesters = useMemo(
    () =>
      universityId
        ? mergeSemesterOptions(
            academicOptions.semestersByUniversity[universityId] ?? [],
            isOriginalUniversity ? student.currentSemesterLabel : null,
          )
        : [],
    [universityId, academicOptions.semestersByUniversity, student.currentSemesterLabel, isOriginalUniversity],
  );

  function handleUniversityChange(nextId: string) {
    setUniversityId(nextId);
    setDegreeProgram("");
    setSemesterLabel("");
  }

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    saveOwnProfileEdit,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Profile updated.");
      clearDraft();
      onSuccess?.();
      router.push(profileHref);
    }
  }, [state]);

  useEffect(() => {
    saveDraft({ universityId, degreeProgram, currentSemesterLabel: semesterLabel, yearOfStudy });
  }, [universityId, degreeProgram, semesterLabel, yearOfStudy]);

  return (
    <div className="space-y-6">
      {/* ── Page heading + actions ── */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">Edit profile</h1>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            render={<Link href={profileHref} />}
            onClick={() => {
              clearDraft();
              setUniversityId(student.universityId ?? "");
              setDegreeProgram(student.degreeProgram ?? "");
              setSemesterLabel(student.currentSemesterLabel ?? "");
              setYearOfStudy(student.yearOfStudy ?? "");
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              if (formRef.current) {
                formRef.current.requestSubmit();
              }
            }}
          >
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* ── Photo ── */}
      <StudentPhotoSection
        photoUrl={currentPhotoUrl}
        fullName={fullName}
        initials={initials}
        onUploaded={setCurrentPhotoUrl}
      />

      {/* ── Main form ── */}
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          if (!e.currentTarget.checkValidity()) {
            e.currentTarget.reportValidity();
            return;
          }
          formAction(new FormData(e.currentTarget));
        }}
        onChange={onFormChange}
        className="space-y-5"
      >
        {/* Personal information */}
        <Group title="Personal information">
          <PairRow
            label1="First name"
            children1={
              <FieldInput id="firstName" name="firstName" required defaultValue={getDraft("firstName", student.firstName)} />
            }
            label2="Last name"
            children2={
              <FieldInput id="lastName" name="lastName" required defaultValue={getDraft("lastName", student.lastName)} />
            }
          />
          <Row label="Student ID" locked>
            <LockedValue>
              {student.studentId ?? <span className="italic opacity-60">Not set</span>}
            </LockedValue>
            <input type="hidden" name="studentId" value={student.studentId ?? ""} />
          </Row>
          <Row label="Email address" locked>
            <LockedValue>{student.email}</LockedValue>
            <input type="hidden" name="email" value={student.email} />
          </Row>
          <Row label="Phone number">
            <FieldInput
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={getDraft("phone", student.phone ?? "")}
              pattern="[\d\s+()\-.]{7,20}"
              title="Enter a valid phone number (7–20 digits, spaces, +, -, ( ) allowed)"
              placeholder="e.g. 081 000 0000"
            />
          </Row>
          <Row label="Religion">
            <FieldSelect
              id="religion"
              name="religion"
              defaultValue={getDraft("religion", student.religion ?? "")}
            >
              <option value="">— Not specified —</option>
              {RELIGIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {RELIGION_LABELS[opt]}
                </option>
              ))}
            </FieldSelect>
          </Row>
          <Row label="Ethnicity" align="start">
            <EthnicityChipSelect
              defaultSelected={ethnicities}
              onSelectionChange={(values) => {
                setEthnicities(values);
                saveDraft({ __chips_ethnicity: JSON.stringify(values) });
              }}
            />
          </Row>
        </Group>

        {/* Academic information */}
        <Group title="Academic information">
          {/* Hidden inputs for controlled values */}
          <input type="hidden" name="universityId" value={universityId} />
          <input type="hidden" name="degreeProgram" value={degreeProgram} />
          <input type="hidden" name="currentSemesterLabel" value={semesterLabel} />
          <input type="hidden" name="yearOfStudy" value={yearOfStudy} />

          <Row label="University">
            <FieldSelect
              id="edit-universityId"
              value={universityId}
              onChange={(e) => handleUniversityChange(e.target.value)}
            >
              <option value="">— None —</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </FieldSelect>
          </Row>

          <PairRow
            label1="Degree program"
            children1={
              <FieldSelect
                id="edit-degreeProgram"
                value={degreeProgram}
                onChange={(e) => setDegreeProgram(e.target.value)}
                disabled={!universityId || programs.length === 0}
              >
                <option value="">
                  {!universityId
                    ? "Select a university first"
                    : programs.length === 0
                      ? "No programs configured"
                      : "Select a program…"}
                </option>
                {programs.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </FieldSelect>
            }
            label2="Year of study"
            children2={
              <FieldInput
                id="edit-yearOfStudy"
                type="number"
                inputMode="numeric"
                min="1"
                max="10"
                step="1"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                placeholder="e.g. 2"
              />
            }
          />

          <PairRow
            label1="Current semester"
            children1={
              <FieldSelect
                id="edit-currentSemesterLabel"
                value={semesterLabel}
                onChange={(e) => setSemesterLabel(e.target.value)}
                disabled={!universityId || semesters.length === 0}
              >
                <option value="">
                  {!universityId
                    ? "Select a university first"
                    : semesters.length === 0
                      ? "No semesters configured"
                      : "Select semester…"}
                </option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.label}>
                    {s.label}
                    {s.academicYear ? ` (${s.academicYear})` : ""}
                  </option>
                ))}
              </FieldSelect>
            }
            label2="GPA"
            children2={
              <FieldInput
                id="gpa"
                name="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                defaultValue={getDraft("gpa", student.gpa ?? "")}
              />
            }
          />
          <PairRow
            label1="Scholarship type"
            children1={
              <FieldSelect
                id="scholarshipType"
                name="scholarshipType"
                defaultValue={getDraft("scholarshipType", student.scholarshipType ?? "")}
              >
                <option value="">— Not specified —</option>
                {SCHOLARSHIP_TYPES.map((opt) => (
                  <option key={opt} value={opt}>
                    {SCHOLARSHIP_TYPE_LABELS[opt]}
                  </option>
                ))}
              </FieldSelect>
            }
            label2="Graduation year"
            children2={
              <FieldSelect
                id="graduationYear"
                name="graduationYear"
                defaultValue={getDraft(
                  "graduationYear",
                  student.graduationYear != null ? String(student.graduationYear) : "",
                )}
              >
                <option value="">— Not specified —</option>
                {graduationYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </FieldSelect>
            }
          />
        </Group>

        {/* Bank information */}
        <Group title="Bank information">
          <input type="hidden" name="bankAccountId" value={account1?.id ?? ""} />
          <PairRow
            label1="Bank name"
            children1={
              <FieldInput id="bankName" name="bankName" defaultValue={getDraft("bankName", account1?.bankName ?? "")} />
            }
            label2="Account holder"
            children2={
              <FieldInput id="bankAccountName" name="bankAccountName" defaultValue={getDraft("bankAccountName", account1?.bankAccountName ?? "")} />
            }
          />
          <PairRow
            label1="Account number"
            children1={
              <FieldInput
                id="bankAccountNumber"
                name="bankAccountNumber"
                inputMode="numeric"
                pattern="[\d\s-]{5,25}"
                title="Enter a valid account number (5–25 digits)"
                defaultValue={getDraft("bankAccountNumber", account1?.bankAccountNumber ?? "")}
              />
            }
            label2="PromptPay"
            children2={
              <FieldInput id="promptpayNumber" name="promptpayNumber" defaultValue={getDraft("promptpayNumber", account1?.promptpayNumber ?? "")} />
            }
          />
        </Group>

        {showSecondAccount ? (
          <Group title="Second bank account">
            <input type="hidden" name="includeBankAccount2" value="1" />
            <input type="hidden" name="bankAccountId2" value={account2?.id ?? ""} />
            <div className="flex justify-end border-b border-border/30 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => setShowSecondAccount(false)}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>
            <PairRow
              label1="Bank name"
              children1={
                <FieldInput id="bankName2" name="bankName2" defaultValue={getDraft("bankName2", account2?.bankName ?? "")} />
              }
              label2="Account holder"
              children2={
                <FieldInput id="bankAccountName2" name="bankAccountName2" defaultValue={getDraft("bankAccountName2", account2?.bankAccountName ?? "")} />
              }
            />
            <PairRow
              label1="Account number"
              children1={
                <FieldInput
                  id="bankAccountNumber2"
                  name="bankAccountNumber2"
                  inputMode="numeric"
                  pattern="[\d\s-]{5,25}"
                  title="Enter a valid account number (5–25 digits)"
                  defaultValue={getDraft("bankAccountNumber2", account2?.bankAccountNumber ?? "")}
                />
              }
              label2="PromptPay"
              children2={
                <FieldInput id="promptpayNumber2" name="promptpayNumber2" defaultValue={getDraft("promptpayNumber2", account2?.promptpayNumber ?? "")} />
              }
            />
          </Group>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setShowSecondAccount(true)}
          >
            <Plus className="size-3.5" />
            Add a second bank account
          </Button>
        )}

        {state.error ? (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        ) : null}
      </form>
    </div>
  );
}
