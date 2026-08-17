"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { uploadFileToStorage, validateUpload } from "@/lib/uploads";
import { readBankAccountsFromFormData } from "@/lib/bank-accounts";
import {
  readStudentSelfProfileFromFormData,
  validateStudentProfileSelfEdit,
} from "@/lib/validations/student-profile";
import { validateUniversityContext } from "@/lib/validations/student-university";

const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

export type ActionState = {
  error?: string;
  success?: boolean;
};

async function apiFetch(
  path: string,
  method: string,
  body: unknown,
): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${apiBase}/api${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (data as any).error ?? "Request failed." };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

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
  if (!parsed.success) return { error: parsed.error };

  const contextError = await validateUniversityContext(parsed.data, { studentId: student.id });
  if (contextError) return { error: contextError };

  const email = parsed.data.email.toLowerCase();
  const { email: _email, ...profileFields } = parsed.data;

  const payload: Record<string, unknown> = {
    firstName: profileFields.firstName,
    lastName: profileFields.lastName,
    studentId: profileFields.studentId ?? null,
    phone: profileFields.phone ?? null,
    ethnicity: profileFields.ethnicity ?? null,
    scholarshipType: profileFields.scholarshipType ?? null,
    graduationYear: profileFields.graduationYear ?? null,
    religion: profileFields.religion ?? null,
    universityId: profileFields.universityId ?? null,
    degreeProgram: profileFields.degreeProgram ?? null,
    yearOfStudy: profileFields.yearOfStudy ?? null,
    currentSemesterLabel: profileFields.currentSemesterLabel ?? null,
    gpa: profileFields.gpa != null ? String(profileFields.gpa) : null,
  };

  if (email !== user.email) {
    payload.email = email;
  }

  const result = await apiFetch(`/students/${student.id}`, "PUT", payload);
  if (!result.ok) return { error: result.error };

  revalidatePath("/student/profile");
  revalidatePath("/student/profile/edit");
  revalidatePath("/student/submit");
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
  if (!parsed.success) return { error: parsed.error };

  const contextError = await validateUniversityContext(parsed.data, { studentId: student.id });
  if (contextError) return { error: contextError };

  const bankAccounts = readBankAccountsFromFormData(formData);

  const file = formData.get("photo");
  let photoUrl: string | undefined;
  if (file instanceof File && file.size > 0) {
    const check = validateUpload(file, "profile-photo");
    if (!check.ok) return { error: check.error };

    try {
      photoUrl = await uploadFileToStorage(file);
    } catch {
      return { error: "Failed to process photo." };
    }
  }

  const email = parsed.data.email.toLowerCase();
  const { email: _email, ...profileFields } = parsed.data;

  const payload: Record<string, unknown> = {
    firstName: profileFields.firstName,
    lastName: profileFields.lastName,
    studentId: profileFields.studentId ?? null,
    phone: profileFields.phone ?? null,
    ethnicity: profileFields.ethnicity ?? null,
    scholarshipType: profileFields.scholarshipType ?? null,
    graduationYear: profileFields.graduationYear ?? null,
    religion: profileFields.religion ?? null,
    universityId: profileFields.universityId ?? null,
    degreeProgram: profileFields.degreeProgram ?? null,
    yearOfStudy: profileFields.yearOfStudy ?? null,
    currentSemesterLabel: profileFields.currentSemesterLabel ?? null,
    gpa: profileFields.gpa != null ? String(profileFields.gpa) : null,
    bankAccounts,
    ...(photoUrl ? { photoUrl } : {}),
  };

  if (email !== user.email) {
    payload.email = email;
  }

  const result = await apiFetch(`/students/${student.id}`, "PUT", payload);
  if (!result.ok) return { error: result.error };

  revalidatePath("/student/profile");
  revalidatePath("/student/profile/edit");
  revalidatePath("/student/submit");
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
  if (!parsed.success) return { error: "Invalid bank information." };

  const result = await apiFetch(`/students/${student.id}`, "PUT", parsed.data);
  if (!result.ok) return { error: result.error };

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
    const photoUrl = await uploadFileToStorage(file);

    const result = await apiFetch(`/students/${student.id}`, "PUT", { photoUrl });
    if (!result.ok) return { error: result.error };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to upload photo." };
  }

  revalidatePath("/student/profile");
  revalidatePath("/student/profile/edit");
  return { success: true };
}
