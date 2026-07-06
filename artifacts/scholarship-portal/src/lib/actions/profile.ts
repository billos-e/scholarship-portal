"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { syncStudentSession } from "@/lib/auth/sync-session";
import {
  updateStudentById,
  updateBankByStudentId,
  updateUserById,
  rawStudents,
  userByEmail,
  type Any,
} from "@/lib/stub/sample-data";
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

const bankSchema = z.object({
  bankAccountName: z.string().trim().optional(),
  bankAccountNumber: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  promptpayNumber: z.string().trim().optional(),
});

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
    const dup = rawStudents.find(
      (s: Any) => s.studentId === parsed.data.studentId && s.id !== student.id,
    );
    if (dup) return { error: "This Student ID is already in use." };
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== user.email) {
    const existing = userByEmail(email);
    if (existing) {
      return { error: "An account with this email already exists." };
    }
  }

  const { email: _email, ...profileFields } = parsed.data;

  updateStudentById(student.id, {
    firstName: profileFields.firstName,
    lastName: profileFields.lastName,
    studentId: profileFields.studentId ?? null,
    phone: profileFields.phone ?? null,
    universityId: profileFields.universityId ?? null,
    degreeProgram: profileFields.degreeProgram ?? null,
    yearOfStudy: profileFields.yearOfStudy ?? null,
    currentSemesterLabel: profileFields.currentSemesterLabel ?? null,
    gpa: profileFields.gpa ?? null,
  });
  if (email !== user.email) {
    updateUserById(user.id, { email });
  }

  revalidatePath("/student/profile");
  revalidatePath("/student/profile/edit");
  revalidatePath("/student/submit");
  await syncStudentSession(
    profileFields.firstName,
    profileFields.lastName,
  );
  return { success: true };
}

export async function saveOwnProfileEdit(
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
    const dup = rawStudents.find(
      (s: Any) => s.studentId === parsed.data.studentId && s.id !== student.id,
    );
    if (dup) return { error: "This Student ID is already in use." };
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== user.email) {
    const existing = userByEmail(email);
    if (existing) {
      return { error: "An account with this email already exists." };
    }
  }

  const bankParsed = bankSchema.safeParse({
    bankAccountName: optionalString(formData.get("bankAccountName")),
    bankAccountNumber: optionalString(formData.get("bankAccountNumber")),
    bankName: optionalString(formData.get("bankName")),
    promptpayNumber: optionalString(formData.get("promptpayNumber")),
  });
  if (!bankParsed.success) {
    return { error: "Invalid bank information." };
  }

  const file = formData.get("photo");
  let photoUrl: string | undefined;
  if (file instanceof File && file.size > 0) {
    const check = validateUpload(file, "profile-photo");
    if (!check.ok) return { error: check.error };

    try {
      photoUrl = await saveStudentUpload(file, {
        studentId: student.id,
        kind: "profile-photo",
      });
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to upload photo.",
      };
    }
  }

  const { email: _email, ...profileFields } = parsed.data;

  updateStudentById(student.id, {
    firstName: profileFields.firstName,
    lastName: profileFields.lastName,
    studentId: profileFields.studentId ?? null,
    phone: profileFields.phone ?? null,
    universityId: profileFields.universityId ?? null,
    degreeProgram: profileFields.degreeProgram ?? null,
    yearOfStudy: profileFields.yearOfStudy ?? null,
    currentSemesterLabel: profileFields.currentSemesterLabel ?? null,
    gpa: profileFields.gpa ?? null,
    ...(photoUrl ? { photoUrl } : {}),
  });
  updateBankByStudentId(student.id, bankParsed.data);
  if (email !== user.email) {
    updateUserById(user.id, { email });
  }

  revalidatePath("/student/profile");
  revalidatePath("/student/profile/edit");
  revalidatePath("/student/submit");
  await syncStudentSession(
    profileFields.firstName,
    profileFields.lastName,
  );
  return { success: true };
}

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

  updateBankByStudentId(student.id, parsed.data);

  revalidatePath("/student/profile");
  revalidatePath("/student/profile/edit");
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
    const ok = updateStudentById(student.id, { photoUrl });
    if (!ok) return { error: "Student not found." };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to upload photo.",
    };
  }

  revalidatePath("/student/profile");
  revalidatePath("/student/profile/edit");
  return { success: true };
}
