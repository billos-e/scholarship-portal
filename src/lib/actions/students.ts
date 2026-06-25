"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  error?: string;
  success?: boolean;
};

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const s = (value as string | null)?.trim();
  return s && s.length > 0 ? s : undefined;
}

function optionalGpa(value: FormDataEntryValue | null): number | undefined {
  const s = (value as string | null)?.trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

const statusEnum = z.enum(["ACTIVE", "GRADUATED", "INACTIVE"]);

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  studentId: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  universityId: z.string().trim().optional(),
  degreeProgram: z.string().trim().optional(),
  yearOfStudy: z.string().trim().optional(),
  currentSemesterLabel: z.string().trim().optional(),
  gpa: z.number().min(0).max(4).optional(),
  status: statusEnum,
});

function parseProfile(formData: FormData) {
  return profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    studentId: optionalString(formData.get("studentId")),
    phone: optionalString(formData.get("phone")),
    universityId: optionalString(formData.get("universityId")),
    degreeProgram: optionalString(formData.get("degreeProgram")),
    yearOfStudy: optionalString(formData.get("yearOfStudy")),
    currentSemesterLabel: optionalString(formData.get("currentSemesterLabel")),
    gpa: optionalGpa(formData.get("gpa")),
    status: formData.get("status") ?? "ACTIVE",
  });
}

export async function createStudent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  const credsCheck = z
    .object({
      email: z.string().email("A valid email is required."),
      password: z.string().min(8, "Temporary password must be at least 8 characters."),
    })
    .safeParse({ email, password });
  if (!credsCheck.success) {
    return { error: credsCheck.error.issues[0]?.message ?? "Invalid input." };
  }

  const parsed = parseProfile(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  if (parsed.data.studentId) {
    const dupId = await prisma.student.findUnique({
      where: { studentId: parsed.data.studentId },
    });
    if (dupId) return { error: "This Student ID is already in use." };
  }

  const passwordHash = await hashPassword(password);
  const { universityId, ...profile } = parsed.data;

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "STUDENT",
      isActive: profile.status === "ACTIVE",
      student: {
        create: {
          ...profile,
          gpa: parsed.data.gpa ?? null,
          university: universityId ? { connect: { id: universityId } } : undefined,
          bankInformation: { create: {} },
        },
      },
    },
  });

  revalidatePath("/admin/students");
  return { success: true };
}

export async function updateStudent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing student id." };

  const parsed = parseProfile(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return { error: "Student not found." };

  if (parsed.data.studentId) {
    const dupId = await prisma.student.findFirst({
      where: { studentId: parsed.data.studentId, NOT: { id } },
    });
    if (dupId) return { error: "This Student ID is already in use." };
  }

  // Status drives login access: only ACTIVE students can sign in.
  const { universityId, ...rest } = parsed.data;
  await prisma.$transaction([
    prisma.student.update({
      where: { id },
      data: {
        ...rest,
        gpa: parsed.data.gpa ?? null,
        universityId: universityId ?? null,
      },
    }),
    prisma.user.update({
      where: { id: student.userId },
      data: { isActive: parsed.data.status === "ACTIVE" },
    }),
  ]);

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  return { success: true };
}

const bankSchema = z.object({
  bankAccountName: z.string().trim().optional(),
  bankAccountNumber: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  promptpayNumber: z.string().trim().optional(),
});

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
  if (!parsed.success) {
    return { error: "Invalid bank information." };
  }

  await prisma.bankInformation.upsert({
    where: { studentId },
    update: parsed.data,
    create: { studentId, ...parsed.data },
  });

  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}

export async function resetStudentPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const password = formData.get("password") as string;

  const check = z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .safeParse(password);
  if (!userId || !check.success) {
    return { error: check.success ? "Missing user id." : check.error.issues[0].message };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { success: true };
}
