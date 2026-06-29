"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { saveStudentUpload, validateUpload } from "@/lib/uploads";

export type ActionState = {
  error?: string;
  success?: boolean;
};

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const s = (value as string | null)?.trim();
  return s && s.length > 0 ? s : undefined;
}

const contactSchema = z.object({
  phone: z.string().trim().max(40).optional(),
});

export async function updateOwnProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { student } = await requireStudent();

  const parsed = contactSchema.safeParse({
    phone: optionalString(formData.get("phone")),
  });
  if (!parsed.success) {
    return { error: "Invalid contact information." };
  }

  await prisma.student.update({
    where: { id: student.id },
    data: { phone: parsed.data.phone ?? null },
  });

  revalidatePath("/student/profile");
  return { success: true };
}

const bankSchema = z.object({
  bankAccountName: z.string().trim().optional(),
  bankAccountNumber: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  promptpayNumber: z.string().trim().optional(),
});

export async function updateOwnBank(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { student } = await requireStudent();

  const parsed = bankSchema.safeParse({
    bankAccountName: optionalString(formData.get("bankAccountName")),
    bankAccountNumber: optionalString(formData.get("bankAccountNumber")),
    bankName: optionalString(formData.get("bankName")),
    promptpayNumber: optionalString(formData.get("promptpayNumber")),
  });
  if (!parsed.success) {
    return { error: "Invalid bank information." };
  }

  await prisma.bankInformation.upsert({
    where: { studentId: student.id },
    update: parsed.data,
    create: { studentId: student.id, ...parsed.data },
  });

  revalidatePath("/student/profile");
  return { success: true };
}

export async function uploadOwnPhoto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { student } = await requireStudent();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a photo to upload." };
  }

  const check = validateUpload(file, "profile-photo");
  if (!check.ok) return { error: check.error };

  try {
    const photoUrl = await saveStudentUpload(file, {
      studentId: student.id,
      kind: "profile-photo",
    });
    await prisma.student.update({
      where: { id: student.id },
      data: { photoUrl },
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to upload photo.",
    };
  }

  revalidatePath("/student/profile");
  return { success: true };
}
