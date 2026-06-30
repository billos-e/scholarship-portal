"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { saveStudentUpload, validateUpload } from "@/lib/uploads";
import {
  readStudentSelfProfileFromFormData,
  validateStudentProfileSelfEdit,
} from "@/lib/validations/student-profile";
import { validateUniversityContext } from "@/lib/validations/student-university";

export type ActionState = {
  error?: string;
  success?: boolean;
};

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const s = (value as string | null)?.trim();
  return s && s.length > 0 ? s : undefined;
}

export async function updateOwnProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, student } = await requireStudent();

  const parsed = validateStudentProfileSelfEdit(
    readStudentSelfProfileFromFormData(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error };
  }

  const contextError = await validateUniversityContext(parsed.data, {
    studentId: student.id,
  });
  if (contextError) {
    return { error: contextError };
  }

  if (parsed.data.studentId) {
    const dupId = await prisma.student.findFirst({
      where: { studentId: parsed.data.studentId, NOT: { id: student.id } },
    });
    if (dupId) return { error: "This Student ID is already in use." };
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "An account with this email already exists." };
    }
  }

  const { email: _email, ...profileFields } = parsed.data;

  await prisma.$transaction([
    prisma.student.update({
      where: { id: student.id },
      data: {
        firstName: profileFields.firstName,
        lastName: profileFields.lastName,
        studentId: profileFields.studentId ?? null,
        phone: profileFields.phone ?? null,
        universityId: profileFields.universityId ?? null,
        degreeProgram: profileFields.degreeProgram ?? null,
        yearOfStudy: profileFields.yearOfStudy ?? null,
        currentSemesterLabel: profileFields.currentSemesterLabel ?? null,
        gpa: profileFields.gpa ?? null,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { email },
    }),
  ]);

  revalidatePath("/student/profile");
  revalidatePath("/student/submit");
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
