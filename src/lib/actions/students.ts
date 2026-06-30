"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { generateSecurePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  readStudentProfileFromFormData,
  validateStudentProfileCreate,
  validateStudentProfileEdit,
  type StudentProfileCreateData,
  type StudentProfileFormData,
} from "@/lib/validations/student-profile";
import { validateUniversityContext } from "@/lib/validations/student-university";

export type ActionState = {
  error?: string;
  success?: boolean;
  generatedPassword?: string;
};

function profileToStudentData(
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
    gpa: rest.gpa ?? null,
    status: rest.status,
    universityId: universityId ?? null,
  };
}

export async function createStudent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const emailCheck = z
    .string()
    .email("A valid email is required.")
    .safeParse(email);
  if (!emailCheck.success) {
    return { error: emailCheck.error.issues[0]?.message ?? "Invalid email." };
  }

  const parsed = validateStudentProfileCreate(
    readStudentProfileFromFormData(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error };
  }

  const contextError = await validateUniversityContext(parsed.data);
  if (contextError) {
    return { error: contextError };
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

  const password = generateSecurePassword();
  const passwordHash = await hashPassword(password);
  const studentData = profileToStudentData(parsed.data);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "STUDENT",
      isActive: studentData.status === "ACTIVE",
      student: {
        create: {
          ...studentData,
          bankInformation: { create: {} },
        },
      },
    },
  });

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
  if (!parsed.success) {
    return { error: parsed.error };
  }

  const contextError = await validateUniversityContext(parsed.data, {
    studentId: id,
  });
  if (contextError) {
    return { error: contextError };
  }

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return { error: "Student not found." };

  if (parsed.data.studentId) {
    const dupId = await prisma.student.findFirst({
      where: { studentId: parsed.data.studentId, NOT: { id } },
    });
    if (dupId) return { error: "This Student ID is already in use." };
  }

  const studentData = profileToStudentData(parsed.data);

  await prisma.$transaction([
    prisma.student.update({
      where: { id },
      data: studentData,
    }),
    prisma.user.update({
      where: { id: student.userId },
      data: { isActive: parsed.data.status === "ACTIVE" },
    }),
  ]);

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  revalidatePath(`/admin/students/${id}/edit`);
  return { success: true };
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

export async function saveStudentEdit(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const userId = formData.get("userId") as string;
  if (!id || !userId) return { error: "Missing student id." };

  const parsed = validateStudentProfileEdit(
    readStudentProfileFromFormData(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error };
  }

  const contextError = await validateUniversityContext(parsed.data, {
    studentId: id,
  });
  if (contextError) {
    return { error: contextError };
  }

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return { error: "Student not found." };

  if (parsed.data.studentId) {
    const dupId = await prisma.student.findFirst({
      where: { studentId: parsed.data.studentId, NOT: { id } },
    });
    if (dupId) return { error: "This Student ID is already in use." };
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

  const password = optionalString(formData.get("password"));
  if (password) {
    const passwordCheck = z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .safeParse(password);
    if (!passwordCheck.success) {
      return {
        error:
          passwordCheck.error.issues[0]?.message ?? "Invalid password.",
      };
    }
  }

  const file = formData.get("photo");
  let photoUrl: string | undefined;
  if (file instanceof File && file.size > 0) {
    const { validateUpload, saveStudentUpload } = await import("@/lib/uploads");
    const check = validateUpload(file, "profile-photo");
    if (!check.ok) return { error: check.error };

    try {
      photoUrl = await saveStudentUpload(file, {
        studentId: id,
        kind: "profile-photo",
      });
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to upload photo.",
      };
    }
  }

  const studentData = profileToStudentData(parsed.data);
  const passwordHash = password ? await hashPassword(password) : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.student.update({
      where: { id },
      data: {
        ...studentData,
        ...(photoUrl ? { photoUrl } : {}),
      },
    });
    await tx.user.update({
      where: { id: userId },
      data: {
        isActive: parsed.data.status === "ACTIVE",
        ...(passwordHash ? { passwordHash } : {}),
      },
    });
    await tx.bankInformation.upsert({
      where: { studentId: id },
      update: bankParsed.data,
      create: { studentId: id, ...bankParsed.data },
    });
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  revalidatePath(`/admin/students/${id}/edit`);
  return { success: true };
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

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return { error: "Student not found." };

  await prisma.$transaction([
    prisma.student.update({ where: { id }, data: { status } }),
    prisma.user.update({
      where: { id: student.userId },
      data: { isActive: false },
    }),
  ]);

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

  const { validateUpload, saveStudentUpload } = await import("@/lib/uploads");
  const check = validateUpload(file, "profile-photo");
  if (!check.ok) return { error: check.error };

  try {
    const photoUrl = await saveStudentUpload(file, {
      studentId: id,
      kind: "profile-photo",
    });
    await prisma.student.update({ where: { id }, data: { photoUrl } });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to upload photo.",
    };
  }

  revalidatePath(`/admin/students/${id}`);
  revalidatePath(`/admin/students/${id}/edit`);
  return { success: true };
}
