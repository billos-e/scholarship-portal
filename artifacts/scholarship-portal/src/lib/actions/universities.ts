"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { validateUpload } from "@/lib/uploads";

const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

export type ActionState = {
  error?: string;
  success?: boolean;
  universityId?: string;
};

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

function parseForm(formData: FormData) {
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

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.university.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: "A university with this name already exists." };
  }

  const university = await prisma.university.create({ data: parsed.data });
  revalidatePath("/admin/universities");
  revalidatePath(`/admin/universities/${university.id}`);
  return { success: true, universityId: university.id };
}

export async function updateUniversity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing university id." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const res = await fetch(`${apiBase}/api/universities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: (body as any).error ?? "Failed to update university." };
    }
  } catch {
    return { error: "Failed to update university." };
  }

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
    const b64 = btoa(
      Array.from(bytes)
        .map((b) => String.fromCharCode(b))
        .join(""),
    );
    const imageDataUrl = `data:${file.type || "image/jpeg"};base64,${b64}`;

    const res = await fetch(`${apiBase}/api/universities/${id}/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: (body as any).error ?? "Failed to upload image." };
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to upload image.",
    };
  }

  revalidatePath(`/admin/universities/${id}`);
  revalidatePath("/admin/universities");
  revalidatePath(`/admin/universities/${id}/edit`);
  return { success: true };
}

export async function deactivateUniversity(id: string) {
  await requireAdmin();
  await prisma.university.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/admin/universities");
  revalidatePath(`/admin/universities/${id}`);
}

export async function toggleUniversityActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.university.update({ where: { id }, data: { isActive } });
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

  await prisma.universitySemester.create({
    data: {
      ...parsed.data,
      isActive: parsed.data.isActive ?? true,
    },
  });

  revalidatePath(`/admin/universities/${parsed.data.universityId}`);
  return { success: true };
}

export async function updateUniversitySemester(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing semester id." };

  const parsed = semesterSchema.safeParse({
    universityId: formData.get("universityId"),
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

  const { universityId, ...data } = parsed.data;
  await prisma.universitySemester.update({
    where: { id },
    data,
  });

  revalidatePath(`/admin/universities/${universityId}`);
  return { success: true };
}

export async function toggleUniversitySemesterActive(
  id: string,
  universityId: string,
  isActive: boolean,
) {
  await requireAdmin();
  await prisma.universitySemester.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath(`/admin/universities/${universityId}`);
}

export async function deleteUniversitySemester(
  id: string,
  universityId: string,
) {
  await requireAdmin();

  const linked = await prisma.tuitionPaymentRequest.count({
    where: { universitySemesterId: id },
  });
  if (linked > 0) {
    throw new Error(
      "Cannot delete a semester linked to submissions. Deactivate it instead.",
    );
  }

  await prisma.universitySemester.delete({ where: { id } });
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
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid degree program.",
    };
  }

  const duplicate = await prisma.degreeProgram.findFirst({
    where: {
      universityId: parsed.data.universityId,
      name: { equals: parsed.data.name, mode: "insensitive" },
    },
  });
  if (duplicate) {
    return { error: "A program with this name already exists at this university." };
  }

  await prisma.degreeProgram.create({
    data: {
      universityId: parsed.data.universityId,
      name: parsed.data.name,
      isActive: parsed.data.isActive ?? true,
    },
  });

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
  if (!id) return { error: "Missing program id." };

  const parsed = degreeProgramSchema.safeParse({
    universityId: formData.get("universityId"),
    name: formData.get("name"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid degree program.",
    };
  }

  const duplicate = await prisma.degreeProgram.findFirst({
    where: {
      universityId: parsed.data.universityId,
      name: { equals: parsed.data.name, mode: "insensitive" },
      NOT: { id },
    },
  });
  if (duplicate) {
    return { error: "A program with this name already exists at this university." };
  }

  const { universityId, ...data } = parsed.data;
  await prisma.degreeProgram.update({
    where: { id },
    data,
  });

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
  await prisma.degreeProgram.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath(`/admin/universities/${universityId}`);
  revalidatePath("/student/profile/edit");
}

export async function deleteUniversityDegreeProgram(
  id: string,
  universityId: string,
) {
  await requireAdmin();

  const program = await prisma.degreeProgram.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!program) return;

  const linked = await prisma.student.count({
    where: {
      universityId,
      degreeProgram: { equals: program.name, mode: "insensitive" },
    },
  });
  if (linked > 0) {
    throw new Error(
      "Cannot delete a program assigned to students. Deactivate it instead.",
    );
  }

  await prisma.degreeProgram.delete({ where: { id } });
  revalidatePath(`/admin/universities/${universityId}`);
  revalidatePath("/student/profile/edit");
}
