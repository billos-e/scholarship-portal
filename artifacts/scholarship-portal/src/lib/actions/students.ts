"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { generateSecurePassword } from "@/lib/password";
import {
  readStudentProfileFromFormData,
  validateStudentProfileCreate,
  validateStudentProfileEdit,
  type StudentProfileCreateData,
  type StudentProfileFormData,
} from "@/lib/validations/student-profile";
import { validateUniversityContext } from "@/lib/validations/student-university";

const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

export type ActionState = {
  error?: string;
  success?: boolean;
  generatedPassword?: string;
  submitAttempt?: number;
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

function profileToPayload(
  data: StudentProfileFormData | StudentProfileCreateData,
) {
  const { universityId, ...rest } = data;
  return {
    firstName: rest.firstName || "",
    lastName: rest.lastName || "",
    studentId: rest.studentId ?? null,
    phone: rest.phone ?? null,
    degreeProgram: rest.degreeProgram ?? null,
    yearOfStudy: rest.yearOfStudy ?? null,
    currentSemesterLabel: rest.currentSemesterLabel ?? null,
    gpa: rest.gpa != null ? String(rest.gpa) : null,
    status: rest.status,
    universityId: universityId ?? null,
  };
}

const bankSchema = z.object({
  bankAccountName: z.string().trim().optional(),
  bankAccountNumber: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  promptpayNumber: z.string().trim().optional(),
});

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const s = (value as string | null)?.trim();
  return s && s.length > 0 ? s : undefined;
}

export async function createStudent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const emailCheck = z.string().email("A valid email is required.").safeParse(email);
  if (!emailCheck.success) {
    return { error: emailCheck.error.issues[0]?.message ?? "Invalid email." };
  }

  const parsed = validateStudentProfileCreate(readStudentProfileFromFormData(formData));
  if (!parsed.success) return { error: parsed.error };

  const contextError = await validateUniversityContext(parsed.data);
  if (contextError) return { error: contextError };

  const password = generateSecurePassword();
  const payload = profileToPayload(parsed.data);

  const result = await apiFetch("/students", "POST", {
    email,
    password,
    ...payload,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/students");
  return { success: true, generatedPassword: password };
}

export async function updateStudent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing student id." };

  const parsed = validateStudentProfileEdit(readStudentProfileFromFormData(formData));
  if (!parsed.success) return { error: parsed.error };

  const contextError = await validateUniversityContext(parsed.data, { studentId: id });
  if (contextError) return { error: contextError };

  const result = await apiFetch(`/students/${id}`, "PUT", profileToPayload(parsed.data));
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  revalidatePath(`/admin/students/${id}/edit`);
  return { success: true };
}

export async function updateStudentBank(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const studentId = formData.get("studentId") as string;
  if (!studentId) return { error: "Missing student id." };

  const parsed = bankSchema.safeParse({
    bankAccountName: optionalString(formData.get("bankAccountName")),
    bankAccountNumber: optionalString(formData.get("bankAccountNumber")),
    bankName: optionalString(formData.get("bankName")),
    promptpayNumber: optionalString(formData.get("promptpayNumber")),
  });
  if (!parsed.success) return { error: "Invalid bank information." };

  const result = await apiFetch(`/students/${studentId}`, "PUT", parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}

export async function resetStudentPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const studentId = formData.get("studentId") as string;
  const password = formData.get("password") as string;

  const check = z.string().min(8, "New password must be at least 8 characters.").safeParse(password);
  if (!studentId || !check.success) {
    return { error: check.success ? "Missing student id." : check.error.issues[0].message };
  }

  const result = await apiFetch(`/students/${studentId}`, "PUT", { password });
  if (!result.ok) return { error: result.error };

  return { success: true };
}

export async function saveStudentEdit(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const attempt = (_prev?.submitAttempt ?? 0) + 1;

  const id = formData.get("id") as string;
  const userId = formData.get("userId") as string;
  if (!id || !userId) return { error: "Missing student id.", submitAttempt: attempt };

  const parsed = validateStudentProfileEdit(readStudentProfileFromFormData(formData));
  if (!parsed.success) return { error: parsed.error, submitAttempt: attempt };

  const contextError = await validateUniversityContext(parsed.data, { studentId: id });
  if (contextError) return { error: contextError, submitAttempt: attempt };

  const bankParsed = bankSchema.safeParse({
    bankAccountName: optionalString(formData.get("bankAccountName")),
    bankAccountNumber: optionalString(formData.get("bankAccountNumber")),
    bankName: optionalString(formData.get("bankName")),
    promptpayNumber: optionalString(formData.get("promptpayNumber")),
  });
  if (!bankParsed.success) return { error: "Invalid bank information.", submitAttempt: attempt };

  const password = optionalString(formData.get("password"));
  if (password) {
    const passwordCheck = z.string().min(8, "New password must be at least 8 characters.").safeParse(password);
    if (!passwordCheck.success) {
      return { error: passwordCheck.error.issues[0]?.message ?? "Invalid password.", submitAttempt: attempt };
    }
  }

  const file = formData.get("photo");
  let photoUrl: string | undefined;
  if (file instanceof File && file.size > 0) {
    const { validateUpload } = await import("@/lib/uploads");
    const check = validateUpload(file, "profile-photo");
    if (!check.ok) return { error: check.error, submitAttempt: attempt };

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const b64 = btoa(Array.from(bytes).map((b) => String.fromCharCode(b)).join(""));
      photoUrl = `data:${file.type || "image/jpeg"};base64,${b64}`;
    } catch {
      return { error: "Failed to process photo.", submitAttempt: attempt };
    }
  }

  const payload = {
    ...profileToPayload(parsed.data),
    ...bankParsed.data,
    ...(photoUrl ? { photoUrl } : {}),
    ...(password ? { password } : {}),
  };

  const result = await apiFetch(`/students/${id}`, "PUT", payload);
  if (!result.ok) return { error: result.error, submitAttempt: attempt };

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  revalidatePath(`/admin/students/${id}/edit`);
  return { success: true, submitAttempt: attempt };
}

export async function archiveStudent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const status = formData.get("status") as "INACTIVE" | "GRADUATED";
  if (!id || !["INACTIVE", "GRADUATED"].includes(status)) {
    return { error: "Invalid archive request." };
  }

  const result = await apiFetch(`/students/${id}/archive`, "PUT", { status });
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  return { success: true };
}

export async function uploadStudentPhoto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const file = formData.get("photo");
  if (!id) return { error: "Missing student id." };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a photo to upload." };
  }

  const { validateUpload } = await import("@/lib/uploads");
  const check = validateUpload(file, "profile-photo");
  if (!check.ok) return { error: check.error };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const b64 = btoa(Array.from(bytes).map((b) => String.fromCharCode(b)).join(""));
    const photoUrl = `data:${file.type || "image/jpeg"};base64,${b64}`;

    const result = await apiFetch(`/students/${id}`, "PUT", { photoUrl });
    if (!result.ok) return { error: result.error };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to upload photo." };
  }

  revalidatePath(`/admin/students/${id}`);
  revalidatePath(`/admin/students/${id}/edit`);
  return { success: true };
}
