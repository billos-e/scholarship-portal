"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { validateUpload, type UploadKind } from "@/lib/uploads";
import { ACTIVITY_VALUES, CHALLENGE_VALUES } from "@/lib/submissions/constants";
import {
  getMissingProfileFields,
  profileIncompleteMessage,
} from "@/lib/submissions/eligibility";

const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

export type SubmissionState = {
  error?: string;
  success?: boolean;
};

async function apiFetch(
  path: string,
  method: string,
  body: unknown,
): Promise<{ ok: boolean; data?: any; error?: string; status?: number }> {
  try {
    const res = await fetch(`${apiBase}/api${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (data as any).error ?? "Request failed.", status: res.status };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

function trimmed(value: FormDataEntryValue | null): string | undefined {
  const s = (value as string | null)?.trim();
  return s && s.length > 0 ? s : undefined;
}

function optionalInt(value: FormDataEntryValue | null, { min, max }: { min?: number; max?: number } = {}): number | undefined {
  const s = trimmed(value);
  if (!s) return undefined;
  const n = Number(s);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return undefined;
  if (min !== undefined && n < min) return undefined;
  if (max !== undefined && n > max) return undefined;
  return n;
}

function optionalNumber(value: FormDataEntryValue | null): number | undefined {
  const s = trimmed(value);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function optionalDate(value: FormDataEntryValue | null): Date | undefined {
  const s = trimmed(value);
  if (!s) return undefined;
  const date = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function multiSelect(formData: FormData, name: string, allowed: readonly string[]): string[] {
  const raw = formData.getAll(name).map((v) => String(v));
  const allowedSet = new Set(allowed);
  return Array.from(new Set(raw.filter((v) => allowedSet.has(v))));
}

const submissionSchema = z
  .object({
    semesterLabel: z.string().trim().max(40).optional(),
    universitySemesterId: z.string().trim().optional(),
    amountDue: z
      .number({ message: "Tuition amount is required." })
      .positive("Tuition amount must be greater than zero.")
      .max(10_000_000, "Tuition amount looks too large."),
    dueDate: z.date().optional(),
    bankAccountName: z.string().trim().optional(),
    bankAccountNumber: z.string().trim().optional(),
    bankName: z.string().trim().optional(),
    promptpayNumber: z.string().trim().optional(),
    gpa: z.number().min(0).max(4).optional(),
    creditsCompleted: z.number().int().min(0).max(60).optional(),
    passedAllCourses: z.boolean().optional(),
    wellbeingPhysical: z.number().int().min(1).max(5).optional(),
    wellbeingMental: z.number().int().min(1).max(5).optional(),
    wellbeingFinancial: z.number().int().min(1).max(5).optional(),
    wellbeingStress: z.number().int().min(1).max(5).optional(),
    wellbeingConfidence: z.number().int().min(1).max(5).optional(),
    reflectionAchievement: z.string().trim().max(4000).optional(),
    reflectionChallenge: z.string().trim().max(4000).optional(),
    reflectionAdditional: z.string().trim().max(4000).optional(),
  })
  .refine(
    (d) =>
      (d.universitySemesterId && d.universitySemesterId.length > 0) ||
      (d.semesterLabel && d.semesterLabel.length > 0),
    { message: "Semester is required.", path: ["semesterLabel"] },
  );

function fileIfProvided(value: FormDataEntryValue | null): File | undefined {
  if (!(value instanceof File)) return undefined;
  if (value.size === 0 || value.name === "") return undefined;
  return value;
}

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const b64 = btoa(Array.from(bytes).map((b) => String.fromCharCode(b)).join(""));
  return `data:${file.type || "application/octet-stream"};base64,${b64}`;
}

export async function createSubmission(
  _prev: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const { student } = await requireStudent();

  const missingProfileFields = getMissingProfileFields(student);
  if (missingProfileFields.length > 0) {
    return { error: profileIncompleteMessage(missingProfileFields) };
  }

  const parsed = submissionSchema.safeParse({
    semesterLabel: trimmed(formData.get("semesterLabel")),
    universitySemesterId: trimmed(formData.get("universitySemesterId")),
    amountDue: optionalNumber(formData.get("amountDue")),
    dueDate: optionalDate(formData.get("dueDate")),
    bankAccountName: trimmed(formData.get("bankAccountName")),
    bankAccountNumber: trimmed(formData.get("bankAccountNumber")),
    bankName: trimmed(formData.get("bankName")),
    promptpayNumber: trimmed(formData.get("promptpayNumber")),
    gpa: optionalNumber(formData.get("gpa")),
    creditsCompleted: optionalInt(formData.get("creditsCompleted"), { min: 0, max: 60 }),
    passedAllCourses:
      formData.get("passedAllCourses") === "true"
        ? true
        : formData.get("passedAllCourses") === "false"
          ? false
          : undefined,
    wellbeingPhysical: optionalInt(formData.get("wellbeingPhysical"), { min: 1, max: 5 }),
    wellbeingMental: optionalInt(formData.get("wellbeingMental"), { min: 1, max: 5 }),
    wellbeingFinancial: optionalInt(formData.get("wellbeingFinancial"), { min: 1, max: 5 }),
    wellbeingStress: optionalInt(formData.get("wellbeingStress"), { min: 1, max: 5 }),
    wellbeingConfidence: optionalInt(formData.get("wellbeingConfidence"), { min: 1, max: 5 }),
    reflectionAchievement: trimmed(formData.get("reflectionAchievement")),
    reflectionChallenge: trimmed(formData.get("reflectionChallenge")),
    reflectionAdditional: trimmed(formData.get("reflectionAdditional")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const data = parsed.data;
  const challenges = multiSelect(formData, "challenges", CHALLENGE_VALUES);
  const activities = multiSelect(formData, "activities", ACTIVITY_VALUES);

  const invoiceFile = fileIfProvided(formData.get("invoiceFile"));
  const transcriptFile = fileIfProvided(formData.get("transcriptFile"));
  const screenshotFile =
    fileIfProvided(formData.get("screenshotFile")) ??
    fileIfProvided(formData.get("qrFile"));

  for (const [file, kind] of [
    [invoiceFile, "invoices"] as const,
    [transcriptFile, "transcripts"] as const,
    [screenshotFile, "qr"] as const,
  ]) {
    if (!file) continue;
    const check = validateUpload(file, kind as UploadKind);
    if (!check.ok) return { error: check.error };
  }

  let invoiceFileUrl: string | undefined;
  let transcriptFileUrl: string | undefined;
  let qrPaymentImageUrl: string | undefined;

  try {
    if (invoiceFile) invoiceFileUrl = await fileToDataUrl(invoiceFile);
    if (transcriptFile) transcriptFileUrl = await fileToDataUrl(transcriptFile);
    if (screenshotFile) qrPaymentImageUrl = await fileToDataUrl(screenshotFile);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to process uploaded files." };
  }

  const result = await apiFetch("/submissions", "POST", {
    studentId: student.id,
    semesterLabel: data.semesterLabel,
    universitySemesterId: data.universitySemesterId,
    amountDue: data.amountDue,
    dueDate: data.dueDate?.toISOString(),
    invoiceFileUrl: invoiceFileUrl ?? null,
    bankAccountName: data.bankAccountName ?? null,
    bankAccountNumber: data.bankAccountNumber ?? null,
    bankName: data.bankName ?? null,
    promptpayNumber: data.promptpayNumber ?? null,
    qrPaymentImageUrl: qrPaymentImageUrl ?? null,
    gpa: data.gpa ?? null,
    creditsCompleted: data.creditsCompleted ?? null,
    passedAllCourses: data.passedAllCourses ?? null,
    transcriptFileUrl: transcriptFileUrl ?? null,
    wellbeingPhysical: data.wellbeingPhysical ?? null,
    wellbeingMental: data.wellbeingMental ?? null,
    wellbeingFinancial: data.wellbeingFinancial ?? null,
    wellbeingStress: data.wellbeingStress ?? null,
    wellbeingConfidence: data.wellbeingConfidence ?? null,
    challenges,
    activities,
    reflectionAchievement: data.reflectionAchievement ?? null,
    reflectionChallenge: data.reflectionChallenge ?? null,
    reflectionAdditional: data.reflectionAdditional ?? null,
  });

  if (!result.ok) {
    return { error: result.error ?? "Could not save your submission. Please try again or contact the team." };
  }

  revalidatePath("/student");
  revalidatePath("/student/history");
  revalidatePath("/student/profile");

  const createdRequestId = result.data?.requestId;
  if (createdRequestId) {
    redirect(`/student/history/${createdRequestId}`);
  }
  return { success: true };
}
