"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  error?: string;
  success?: boolean;
};

const universitySchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  hasSummerSemester: z.boolean(),
  isActive: z.boolean(),
  notes: z.string().trim().optional(),
});

function parseForm(formData: FormData) {
  return universitySchema.safeParse({
    name: formData.get("name"),
    hasSummerSemester: formData.get("hasSummerSemester") === "on",
    isActive: formData.get("isActive") === "on",
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

  await prisma.university.create({ data: parsed.data });
  revalidatePath("/admin/universities");
  return { success: true };
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

  const duplicate = await prisma.university.findFirst({
    where: { name: parsed.data.name, NOT: { id } },
  });
  if (duplicate) {
    return { error: "A university with this name already exists." };
  }

  await prisma.university.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/universities");
  return { success: true };
}

export async function toggleUniversityActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.university.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/universities");
}
