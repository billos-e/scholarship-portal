import type { StudentStatus } from "@prisma/client";

import { hashPassword } from "@/lib/auth/password";
import { generateSecurePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

import { applyColumnMapping } from "../apply-mapping";
import { getImportFields } from "../fields";
import { parseGpa, parseStudentStatus } from "../parsers";
import type {
  ColumnMapping,
  ImportCommitResult,
  ImportPreviewResult,
  ImportRowPreview,
} from "../types";

type MappedRow = { line: number; values: Record<string, string> };

type ParsedStudent = {
  line: number;
  email: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  phone?: string;
  university?: string;
  degreeProgram?: string;
  yearOfStudy?: string;
  currentSemesterLabel?: string;
  gpa?: number;
  status: StudentStatus;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  promptpayNumber?: string;
};

function parseStudentRow(row: MappedRow): { ok: ParsedStudent } | { line: number; error: string } {
  const { line, values } = row;
  const email = values.email?.trim().toLowerCase();
  const firstName = values.first_name?.trim();
  const lastName = values.last_name?.trim();

  if (!email || !firstName || !lastName) {
    return { line, error: "Email, first name, and last name are required." };
  }

  const gpaRaw = values.gpa?.trim();
  const gpa = gpaRaw ? parseGpa(gpaRaw) : undefined;
  if (gpaRaw && gpa == null) {
    return { line, error: "GPA must be a number between 0 and 4." };
  }

  return {
    ok: {
      line,
      email,
      firstName,
      lastName,
      studentId: values.student_id?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      university: values.university?.trim() || undefined,
      degreeProgram: values.degree_program?.trim() || undefined,
      yearOfStudy: values.year_of_study?.trim() || undefined,
      currentSemesterLabel: values.current_semester?.trim() || undefined,
      gpa,
      status: parseStudentStatus(values.status),
      bankAccountName: values.bank_account_name?.trim() || undefined,
      bankAccountNumber: values.bank_account_number?.trim() || undefined,
      bankName: values.bank_name?.trim() || undefined,
      promptpayNumber: values.promptpay_number?.trim() || undefined,
    },
  };
}

async function resolveUniversityId(name: string): Promise<string | null> {
  const existing = await prisma.university.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  return existing?.id ?? null;
}

export async function previewStudentsImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportPreviewResult> {
  const fields = getImportFields("students");
  const mapped = applyColumnMapping(rows, mapping, fields);
  const previews: ImportRowPreview[] = [];

  for (const row of mapped) {
    const parsed = parseStudentRow(row);
    if ("error" in parsed) {
      previews.push({ line: parsed.line, status: "error", message: parsed.error });
      continue;
    }

    const data = parsed.ok;
    const messages: string[] = [];

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existingUser) {
      messages.push("Email already exists — row will be skipped on import.");
    }

    if (data.studentId) {
      const dup = await prisma.student.findUnique({
        where: { studentId: data.studentId },
        select: { id: true },
      });
      if (dup) {
        messages.push("Student ID already in use — row will be skipped on import.");
      }
    }

    if (data.university) {
      const uniId = await resolveUniversityId(data.university);
      if (!uniId) {
        messages.push(`University "${data.university}" not found — will be created on import.`);
      }
    }

    previews.push({
      line: data.line,
      status: messages.length > 0 ? "warning" : "valid",
      message: messages.join(" "),
      data,
    });
  }

  return summarize(previews);
}

export async function commitStudentsImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  password?: string,
): Promise<ImportCommitResult> {
  const fields = getImportFields("students");
  const mapped = applyColumnMapping(rows, mapping, fields);

  const tempPassword = password?.trim() || generateSecurePassword();
  const passwordHash = await hashPassword(tempPassword);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of mapped) {
    const parsed = parseStudentRow(row);
    if ("error" in parsed) {
      skipped++;
      errors.push(`Line ${parsed.line}: ${parsed.error}`);
      continue;
    }

    const data = parsed.ok;

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      skipped++;
      errors.push(`Line ${data.line}: email already exists (${data.email}).`);
      continue;
    }

    if (data.studentId) {
      const dup = await prisma.student.findUnique({
        where: { studentId: data.studentId },
      });
      if (dup) {
        skipped++;
        errors.push(`Line ${data.line}: student ID already exists (${data.studentId}).`);
        continue;
      }
    }

    let universityId: string | null = null;
    if (data.university) {
      const existing = await prisma.university.findFirst({
        where: { name: { equals: data.university, mode: "insensitive" } },
      });
      if (existing) {
        universityId = existing.id;
      } else {
        const createdUni = await prisma.university.create({
          data: { name: data.university, isActive: true },
        });
        universityId = createdUni.id;
      }
    }

    const hasBank =
      data.bankAccountName ||
      data.bankAccountNumber ||
      data.bankName ||
      data.promptpayNumber;

    try {
      await prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: "STUDENT",
          isActive: data.status === "ACTIVE",
          student: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              studentId: data.studentId ?? null,
              phone: data.phone ?? null,
              universityId,
              degreeProgram: data.degreeProgram ?? null,
              yearOfStudy: data.yearOfStudy ?? null,
              currentSemesterLabel: data.currentSemesterLabel ?? null,
              gpa: data.gpa ?? null,
              status: data.status,
              bankInformation: hasBank
                ? {
                    create: {
                      bankAccountName: data.bankAccountName ?? null,
                      bankAccountNumber: data.bankAccountNumber ?? null,
                      bankName: data.bankName ?? null,
                      promptpayNumber: data.promptpayNumber ?? null,
                    },
                  }
                : { create: {} },
            },
          },
        },
      });
      created++;
    } catch {
      skipped++;
      errors.push(`Line ${data.line}: could not create student (${data.email}).`);
    }
  }

  return {
    created,
    updated,
    skipped,
    errors,
    generatedPassword: created > 0 ? tempPassword : undefined,
  };
}

function summarize(rows: ImportRowPreview[]): ImportPreviewResult {
  const validCount = rows.filter((r) => r.status === "valid").length;
  const warningCount = rows.filter((r) => r.status === "warning").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  return { rows, validCount, warningCount, errorCount };
}
