"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { saveUpload, validateUpload, type UploadKind } from "@/lib/uploads";
import {
  ACTIVITY_VALUES,
  CHALLENGE_VALUES,
} from "@/lib/submissions/constants";

export type SubmissionState = {
  error?: string;
  success?: boolean;
};

function trimmed(value: FormDataEntryValue | null): string | undefined {
  const s = (value as string | null)?.trim();
  return s && s.length > 0 ? s : undefined;
}

function optionalInt(
  value: FormDataEntryValue | null,
  { min, max }: { min?: number; max?: number } = {},
): number | undefined {
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
  // Treat the date string as UTC midnight so it doesn't drift across timezones.
  const date = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function multiSelect(
  formData: FormData,
  name: string,
  allowed: readonly string[],
): string[] {
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

    // Bank info (snapshot + last-known update)
    bankAccountName: z.string().trim().optional(),
    bankAccountNumber: z.string().trim().optional(),
    bankName: z.string().trim().optional(),
    promptpayNumber: z.string().trim().optional(),

    // Academic
    gpa: z.number().min(0).max(4).optional(),
    creditsCompleted: z.number().int().min(0).max(60).optional(),
    passedAllCourses: z.boolean().optional(),

    // Wellbeing (1..5)
    wellbeingPhysical: z.number().int().min(1).max(5).optional(),
    wellbeingMental: z.number().int().min(1).max(5).optional(),
    wellbeingFinancial: z.number().int().min(1).max(5).optional(),
    wellbeingStress: z.number().int().min(1).max(5).optional(),
    wellbeingConfidence: z.number().int().min(1).max(5).optional(),

    // Reflections
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

export async function createSubmission(
  _prev: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const { student } = await requireStudent();

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
    creditsCompleted: optionalInt(formData.get("creditsCompleted"), {
      min: 0,
      max: 60,
    }),
    passedAllCourses:
      formData.get("passedAllCourses") === "true"
        ? true
        : formData.get("passedAllCourses") === "false"
          ? false
          : undefined,

    wellbeingPhysical: optionalInt(formData.get("wellbeingPhysical"), {
      min: 1,
      max: 5,
    }),
    wellbeingMental: optionalInt(formData.get("wellbeingMental"), {
      min: 1,
      max: 5,
    }),
    wellbeingFinancial: optionalInt(formData.get("wellbeingFinancial"), {
      min: 1,
      max: 5,
    }),
    wellbeingStress: optionalInt(formData.get("wellbeingStress"), {
      min: 1,
      max: 5,
    }),
    wellbeingConfidence: optionalInt(formData.get("wellbeingConfidence"), {
      min: 1,
      max: 5,
    }),

    reflectionAchievement: trimmed(formData.get("reflectionAchievement")),
    reflectionChallenge: trimmed(formData.get("reflectionChallenge")),
    reflectionAdditional: trimmed(formData.get("reflectionAdditional")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const data = parsed.data;

  if (data.universitySemesterId) {
    const semester = await prisma.universitySemester.findFirst({
      where: {
        id: data.universitySemesterId,
        isActive: true,
        universityId: student.universityId ?? undefined,
      },
    });
    if (!semester) {
      return { error: "Please select a valid semester for your university." };
    }
    data.semesterLabel = semester.label;
  }

  if (!data.semesterLabel) {
    return { error: "Semester is required." };
  }

  const semesterLabel = data.semesterLabel;
  const challenges = multiSelect(formData, "challenges", CHALLENGE_VALUES);
  const activities = multiSelect(formData, "activities", ACTIVITY_VALUES);

  // Files (all optional but validated when present).
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
    if (invoiceFile) {
      invoiceFileUrl = await saveUpload(invoiceFile, {
        studentId: student.id,
        kind: "invoices",
      });
    }
    if (transcriptFile) {
      transcriptFileUrl = await saveUpload(transcriptFile, {
        studentId: student.id,
        kind: "transcripts",
      });
    }
    if (screenshotFile) {
      qrPaymentImageUrl = await saveUpload(screenshotFile, {
        studentId: student.id,
        kind: "qr",
      });
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to store uploaded files.";
    return { error: message };
  }

  // If no QR was uploaded this time, fall back to the QR currently on file.
  const existingBank = await prisma.bankInformation.findUnique({
    where: { studentId: student.id },
  });
  const effectiveQr = qrPaymentImageUrl ?? existingBank?.qrPaymentImageUrl ?? null;

  let createdRequestId: string | null = null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.tuitionPaymentRequest.create({
        data: {
          studentId: student.id,
          semesterLabel,
          universitySemesterId: data.universitySemesterId ?? null,
          amountDue: data.amountDue,
          dueDate: data.dueDate ?? null,
          invoiceFileUrl: invoiceFileUrl ?? null,
          status: "SUBMITTED",
          bankAccountName: data.bankAccountName ?? null,
          bankAccountNumber: data.bankAccountNumber ?? null,
          bankName: data.bankName ?? null,
          promptpayNumber: data.promptpayNumber ?? null,
          qrPaymentImageUrl: effectiveQr,
          submittedAt: new Date(),
        },
      });

      await tx.semesterReport.create({
        data: {
          studentId: student.id,
          tuitionPaymentRequestId: request.id,
          semesterLabel,
          universitySemesterId: data.universitySemesterId ?? null,
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
        },
      });

      // Keep the latest-known bank info for the student in sync with the
      // submission's snapshot (plan §6.4 + Phase 2: "update BankInformation").
      await tx.bankInformation.upsert({
        where: { studentId: student.id },
        update: {
          bankAccountName: data.bankAccountName ?? null,
          bankAccountNumber: data.bankAccountNumber ?? null,
          bankName: data.bankName ?? null,
          promptpayNumber: data.promptpayNumber ?? null,
          qrPaymentImageUrl:
            qrPaymentImageUrl ?? existingBank?.qrPaymentImageUrl ?? null,
        },
        create: {
          studentId: student.id,
          bankAccountName: data.bankAccountName ?? null,
          bankAccountNumber: data.bankAccountNumber ?? null,
          bankName: data.bankName ?? null,
          promptpayNumber: data.promptpayNumber ?? null,
          qrPaymentImageUrl: qrPaymentImageUrl ?? null,
        },
      });

      // Mirror the student's "current semester" if it was empty.
      if (!student.currentSemesterLabel) {
        await tx.student.update({
          where: { id: student.id },
          data: { currentSemesterLabel: semesterLabel },
        });
      }

      return request;
    });

    createdRequestId = result.id;
  } catch (err) {
    console.error("createSubmission failed", err);
    return {
      error:
        "Could not save your submission. Please try again or contact the team.",
    };
  }

  revalidatePath("/student");
  revalidatePath("/student/history");
  revalidatePath("/student/profile");

  redirect(`/student/history/${createdRequestId}`);
}
