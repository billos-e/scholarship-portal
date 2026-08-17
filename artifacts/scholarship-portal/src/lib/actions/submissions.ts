"use server";

import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { validateUpload, uploadFileToStorage, type UploadKind } from "@/lib/uploads";
import { ACTIVITY_VALUES, CHALLENGE_VALUES } from "@/lib/submissions/constants";
import {
  getMissingProfileFields,
  profileIncompleteMessage,
  type StudentForEligibility,
} from "@/lib/submissions/eligibility";
import { fetchStudent } from "@/lib/api/students";

const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

export type SubmissionState = {
  error?: string;
  success?: boolean;
  requestId?: string;
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
      .number({ message: "Amount is required." })
      .positive("Amount must be greater than zero.")
      .max(10_000_000, "Amount looks too large."),
    dueDate: z.date().optional(),
    bankAccountId: z.string().trim().optional(),
    bankAccountName: z.string().trim().optional(),
    bankAccountNumber: z.string().trim().optional(),
    bankName: z.string().trim().optional(),
    promptpayNumber: z.string().trim().optional(),
    gpa: z.number().min(0).max(4).optional(),
    creditsCompleted: z.number().int().min(0).max(60).optional(),
    withdrawnFromCourses: z.boolean().optional(),
    academicComment: z.string().trim().max(2000).optional(),
    receivedAcademicExcellenceAward: z.boolean().optional(),
    receivedOtherAward: z.boolean().optional(),
    awardsComment: z.string().trim().max(2000).optional(),
    wellbeingPhysical: z.number().int().min(1).max(5).optional(),
    wellbeingMental: z.number().int().min(1).max(5).optional(),
    wellbeingFinancial: z.number().int().min(1).max(5).optional(),
    wellbeingStress: z.number().int().min(1).max(5).optional(),
    wellbeingConfidence: z.number().int().min(1).max(5).optional(),
    message: z.string().trim().max(2000).optional(),
    requestCategory: z.enum([
      "TUITION",
      "LIVING_EXPENSES",
      "STUDY_ABROAD_INTERNSHIP",
      "EMERGENCY_AID",
    ]),
    activitiesComment: z.string().trim().max(2000).optional(),
    reflectionOvercomeChallenge: z.string().trim().max(4000).optional(),
    reflectionMeaningfulExperience: z.string().trim().max(4000).optional(),
    reflectionProudAchievement: z.string().trim().max(4000).optional(),
  })
  .refine(
    (d) =>
      (d.universitySemesterId && d.universitySemesterId.length > 0) ||
      (d.semesterLabel && d.semesterLabel.length > 0),
    { message: "Semester is required.", path: ["semesterLabel"] },
  );

function optionalBoolean(value: FormDataEntryValue | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function fileIfProvided(value: FormDataEntryValue | null): File | undefined {
  if (!(value instanceof File)) return undefined;
  if (value.size === 0 || value.name === "") return undefined;
  return value;
}

const MAX_AWARD_FILES = 10;

function filesIfProvided(formData: FormData, name: string): File[] {
  return formData.getAll(name).flatMap((value) => {
    const file = fileIfProvided(value);
    return file ? [file] : [];
  });
}

export async function createSubmission(
  _prev: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const { student: sessionStudent } = await requireStudent();

  const fullStudent = await fetchStudent(sessionStudent.id);
  if (!fullStudent) {
    return { error: "Student profile not found. Please contact your administrator." };
  }

  const missingProfileFields = getMissingProfileFields(fullStudent as unknown as StudentForEligibility);
  if (missingProfileFields.length > 0) {
    return { error: profileIncompleteMessage(missingProfileFields) };
  }

  const student = sessionStudent;

  const parsed = submissionSchema.safeParse({
    semesterLabel: trimmed(formData.get("semesterLabel")),
    universitySemesterId: trimmed(formData.get("universitySemesterId")),
    amountDue: optionalNumber(formData.get("amountDue")),
    dueDate: optionalDate(formData.get("dueDate")),
    bankAccountId: trimmed(formData.get("bankAccountId")),
    bankAccountName: trimmed(formData.get("bankAccountName")),
    bankAccountNumber: trimmed(formData.get("bankAccountNumber")),
    bankName: trimmed(formData.get("bankName")),
    promptpayNumber: trimmed(formData.get("promptpayNumber")),
    gpa: optionalNumber(formData.get("gpa")),
    creditsCompleted: optionalInt(formData.get("creditsCompleted"), { min: 0, max: 60 }),
    withdrawnFromCourses: optionalBoolean(formData.get("withdrawnFromCourses")),
    academicComment: trimmed(formData.get("academicComment")),
    receivedAcademicExcellenceAward: optionalBoolean(
      formData.get("receivedAcademicExcellenceAward"),
    ),
    receivedOtherAward: optionalBoolean(formData.get("receivedOtherAward")),
    awardsComment: trimmed(formData.get("awardsComment")),
    wellbeingPhysical: optionalInt(formData.get("wellbeingPhysical"), { min: 1, max: 5 }),
    wellbeingMental: optionalInt(formData.get("wellbeingMental"), { min: 1, max: 5 }),
    wellbeingFinancial: optionalInt(formData.get("wellbeingFinancial"), { min: 1, max: 5 }),
    wellbeingStress: optionalInt(formData.get("wellbeingStress"), { min: 1, max: 5 }),
    wellbeingConfidence: optionalInt(formData.get("wellbeingConfidence"), { min: 1, max: 5 }),
    message: trimmed(formData.get("message")),
    requestCategory: trimmed(formData.get("requestCategory")),
    activitiesComment: trimmed(formData.get("activitiesComment")),
    reflectionOvercomeChallenge: trimmed(
      formData.get("reflectionOvercomeChallenge"),
    ),
    reflectionMeaningfulExperience: trimmed(
      formData.get("reflectionMeaningfulExperience"),
    ),
    reflectionProudAchievement: trimmed(
      formData.get("reflectionProudAchievement"),
    ),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const data = parsed.data;
  const challenges = multiSelect(formData, "challenges", CHALLENGE_VALUES);
  const activities = multiSelect(formData, "activities", ACTIVITY_VALUES);

  const invoiceFile = fileIfProvided(formData.get("invoiceFile"));
  const transcriptFile = fileIfProvided(formData.get("transcriptFile"));
  const awardFiles = filesIfProvided(formData, "awardFiles");
  const screenshotFile =
    fileIfProvided(formData.get("screenshotFile")) ??
    fileIfProvided(formData.get("qrFile"));

  if (awardFiles.length > MAX_AWARD_FILES) {
    return { error: `You can upload at most ${MAX_AWARD_FILES} award documents.` };
  }

  for (const [file, kind] of [
    [invoiceFile, "invoices"] as const,
    [transcriptFile, "transcripts"] as const,
    [screenshotFile, "qr"] as const,
    ...awardFiles.map((file) => [file, "awards"] as const),
  ]) {
    if (!file) continue;
    const check = validateUpload(file, kind as UploadKind);
    if (!check.ok) return { error: check.error };
  }

  let invoiceFileUrl: string | undefined;
  let transcriptFileUrl: string | undefined;
  let qrPaymentImageUrl: string | undefined;
  let awardFileUrls: string[] = [];

  try {
    if (invoiceFile) invoiceFileUrl = await uploadFileToStorage(invoiceFile);
    if (transcriptFile) transcriptFileUrl = await uploadFileToStorage(transcriptFile);
    if (screenshotFile) qrPaymentImageUrl = await uploadFileToStorage(screenshotFile);
    for (const file of awardFiles) {
      awardFileUrls.push(await uploadFileToStorage(file));
    }
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
    message: data.message ?? null,
    requestCategory: data.requestCategory,
    bankAccountId: data.bankAccountId ?? null,
    bankAccountName: data.bankAccountName ?? null,
    bankAccountNumber: data.bankAccountNumber ?? null,
    bankName: data.bankName ?? null,
    promptpayNumber: data.promptpayNumber ?? null,
    qrPaymentImageUrl: qrPaymentImageUrl ?? null,
    gpa: data.gpa ?? null,
    creditsCompleted: data.creditsCompleted ?? null,
    withdrawnFromCourses: data.withdrawnFromCourses ?? null,
    academicComment: data.academicComment ?? null,
    transcriptFileUrl: transcriptFileUrl ?? null,
    receivedAcademicExcellenceAward: data.receivedAcademicExcellenceAward ?? null,
    receivedOtherAward: data.receivedOtherAward ?? null,
    awardFileUrls: awardFileUrls.length > 0 ? awardFileUrls : null,
    awardsComment: data.awardsComment ?? null,
    wellbeingPhysical: data.wellbeingPhysical ?? null,
    wellbeingMental: data.wellbeingMental ?? null,
    wellbeingFinancial: data.wellbeingFinancial ?? null,
    wellbeingStress: data.wellbeingStress ?? null,
    wellbeingConfidence: data.wellbeingConfidence ?? null,
    challenges,
    activities,
    activitiesComment: data.activitiesComment ?? null,
    reflectionOvercomeChallenge: data.reflectionOvercomeChallenge ?? null,
    reflectionMeaningfulExperience: data.reflectionMeaningfulExperience ?? null,
    reflectionProudAchievement: data.reflectionProudAchievement ?? null,
  });

  if (!result.ok) {
    return { error: result.error ?? "Could not save your submission. Please try again or contact the team." };
  }

  const createdRequestId = result.data?.requestId as string | undefined;
  return { success: true, requestId: createdRequestId };
}
