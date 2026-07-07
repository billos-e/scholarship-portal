"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { validateUpload } from "@/lib/uploads";

const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

export type ActionState = {
  error?: string;
  success?: boolean;
  universityId?: string;
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

const universitySchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
  addressLine: z.string().trim().optional(),
  websiteUrl: z.string().trim().url("Invalid website URL.").optional().or(z.literal("")),
  hasSummerSemester: z.boolean(),
  isActive: z.boolean(),
  notes: z.string().trim().optional(),
});

function parseUniversityForm(formData: FormData) {
  const website = (formData.get("websiteUrl") as string)?.trim();
  return universitySchema.safeParse({
    name: formData.get("name"),
    city: (formData.get("city") as string) || undefined,
    country: (formData.get("country") as string) || undefined,
    addressLine: (formData.get("addressLine") as string) || undefined,
    websiteUrl: website && website.length > 0 ? website : undefined,
    hasSummerSemester: formData.get("hasSummerSemester") === "on",
    isActive: formData.has("isActive")
      ? formData.get("isActive") === "on"
      : true,
    notes: (formData.get("notes") as string) || undefined,
  });
}

export async function createUniversity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = parseUniversityForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await apiFetch("/universities", "POST", parsed.data);
  if (!result.ok) return { error: result.error };

  const universityId = result.data?.id;
  revalidatePath("/admin/universities");
  if (universityId) revalidatePath(`/admin/universities/${universityId}`);
  return { success: true, universityId };
}

export async function updateUniversity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing university id." };

  const parsed = parseUniversityForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await apiFetch(`/universities/${id}`, "PUT", parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/universities");
  revalidatePath(`/admin/universities/${id}`);
  revalidatePath(`/admin/universities/${id}/edit`);
  return { success: true };
}

export async function uploadUniversityImage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const file = formData.get("image");
  if (!id) return { error: "Missing university id." };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image to upload." };
  }

  const check = validateUpload(file, "university-image");
  if (!check.ok) return { error: check.error };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const b64 = btoa(Array.from(bytes).map((b) => String.fromCharCode(b)).join(""));
    const imageDataUrl = `data:${file.type || "image/jpeg"};base64,${b64}`;

    const result = await apiFetch(`/universities/${id}/image`, "POST", { imageDataUrl });
    if (!result.ok) return { error: result.error };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to upload image." };
  }

  revalidatePath(`/admin/universities/${id}`);
  revalidatePath("/admin/universities");
  revalidatePath(`/admin/universities/${id}/edit`);
  return { success: true };
}

export async function deactivateUniversity(id: string) {
  await requireAdmin();
  await apiFetch(`/universities/${id}/active`, "PATCH", { isActive: false });
  revalidatePath("/admin/universities");
  revalidatePath(`/admin/universities/${id}`);
}

export async function toggleUniversityActive(id: string, isActive: boolean) {
  await requireAdmin();
  await apiFetch(`/universities/${id}/active`, "PATCH", { isActive });
  revalidatePath("/admin/universities");
  revalidatePath(`/admin/universities/${id}`);
}

const semesterSchema = z.object({
  universityId: z.string().min(1),
  academicYear: z.string().trim().min(1, "Academic year is required."),
  termCode: z.enum(["FALL", "SPRING", "SUMMER", "WINTER"]),
  label: z.string().trim().min(1, "Label is required."),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().optional(),
});

export async function createUniversitySemester(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = semesterSchema.safeParse({
    universityId: formData.get("universityId"),
    academicYear: formData.get("academicYear"),
    termCode: formData.get("termCode"),
    label: formData.get("label"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive") !== "off",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid semester." };
  }
  if (parsed.data.endDate < parsed.data.startDate) {
    return { error: "End date must be after start date." };
  }

  const result = await apiFetch(`/universities/${parsed.data.universityId}/semesters`, "POST", {
    ...parsed.data,
    startDate: parsed.data.startDate.toISOString(),
    endDate: parsed.data.endDate.toISOString(),
    isActive: parsed.data.isActive ?? true,
  });
  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/universities/${parsed.data.universityId}`);
  return { success: true };
}

export async function updateUniversitySemester(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const universityId = formData.get("universityId") as string;
  if (!id) return { error: "Missing semester id." };

  const parsed = semesterSchema.safeParse({
    universityId,
    academicYear: formData.get("academicYear"),
    termCode: formData.get("termCode"),
    label: formData.get("label"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid semester." };
  }
  if (parsed.data.endDate < parsed.data.startDate) {
    return { error: "End date must be after start date." };
  }

  const result = await apiFetch(`/universities/${universityId}/semesters/${id}`, "PUT", {
    ...parsed.data,
    startDate: parsed.data.startDate.toISOString(),
    endDate: parsed.data.endDate.toISOString(),
  });
  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/universities/${universityId}`);
  return { success: true };
}

export async function toggleUniversitySemesterActive(
  id: string,
  universityId: string,
  isActive: boolean,
) {
  await requireAdmin();
  await apiFetch(`/universities/${universityId}/semesters/${id}/active`, "PATCH", { isActive });
  revalidatePath(`/admin/universities/${universityId}`);
}

export async function deleteUniversitySemester(id: string, universityId: string) {
  await requireAdmin();
  const result = await apiFetch(`/universities/${universityId}/semesters/${id}`, "DELETE", {});
  if (!result.ok) throw new Error(result.error ?? "Failed to delete semester.");
  revalidatePath(`/admin/universities/${universityId}`);
}

const degreeProgramSchema = z.object({
  universityId: z.string().min(1),
  name: z.string().trim().min(2, "Program name must be at least 2 characters."),
  isActive: z.boolean().optional(),
});

export async function createUniversityDegreeProgram(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = degreeProgramSchema.safeParse({
    universityId: formData.get("universityId"),
    name: formData.get("name"),
    isActive: formData.get("isActive") !== "off",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid degree program." };
  }

  const result = await apiFetch(`/universities/${parsed.data.universityId}/programs`, "POST", {
    name: parsed.data.name,
    isActive: parsed.data.isActive ?? true,
  });
  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/universities/${parsed.data.universityId}`);
  revalidatePath("/admin/students");
  revalidatePath("/student/profile/edit");
  return { success: true };
}

export async function updateUniversityDegreeProgram(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const universityId = formData.get("universityId") as string;
  if (!id) return { error: "Missing program id." };

  const parsed = degreeProgramSchema.safeParse({
    universityId,
    name: formData.get("name"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid degree program." };
  }

  const result = await apiFetch(`/universities/${universityId}/programs/${id}`, "PUT", {
    name: parsed.data.name,
    isActive: parsed.data.isActive,
  });
  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/universities/${universityId}`);
  revalidatePath("/admin/students");
  revalidatePath("/student/profile/edit");
  return { success: true };
}

export async function toggleUniversityDegreeProgramActive(
  id: string,
  universityId: string,
  isActive: boolean,
) {
  await requireAdmin();
  await apiFetch(`/universities/${universityId}/programs/${id}/active`, "PATCH", { isActive });
  revalidatePath(`/admin/universities/${universityId}`);
  revalidatePath("/student/profile/edit");
}

export async function deleteUniversityDegreeProgram(id: string, universityId: string) {
  await requireAdmin();
  const result = await apiFetch(`/universities/${universityId}/programs/${id}`, "DELETE", {});
  if (!result.ok) throw new Error(result.error ?? "Failed to delete degree program.");
  revalidatePath(`/admin/universities/${universityId}`);
  revalidatePath("/student/profile/edit");
}
