import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { and, desc, eq, ilike } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  db,
  universities,
  degreePrograms,
  universitySemesters,
  users,
  students,
  bankInformation,
  tuitionPaymentRequests,
  paymentHistory,
  SCHOLARSHIP_TYPE_VALUES,
  RELIGION_VALUES,
  type ScholarshipType,
  type Religion,
} from "@workspace/db";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Shared utility types (mirrors SPA import types)
// ---------------------------------------------------------------------------

type ColumnMapping = Record<string, string>;
type ImportRowPreview = {
  line: number;
  status: "valid" | "warning" | "error";
  message?: string;
  data?: unknown;
};
type ImportPreviewResult = {
  rows: ImportRowPreview[];
  validCount: number;
  warningCount: number;
  errorCount: number;
};
type ImportCommitResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  generatedPassword?: string;
};
type TermCode = "FALL" | "SPRING" | "SUMMER" | "WINTER";

// ---------------------------------------------------------------------------
// Parser helpers (replicated from SPA — pure functions, no imports needed)
// ---------------------------------------------------------------------------

function parseBoolean(raw: string | undefined): boolean | undefined {
  if (!raw?.trim()) return undefined;
  const v = raw.trim().toLowerCase();
  if (["true", "yes", "y", "1", "active", "on"].includes(v)) return true;
  if (["false", "no", "n", "0", "inactive", "off"].includes(v)) return false;
  return undefined;
}

function parseNumber(raw: string | undefined): number | undefined {
  if (!raw?.trim()) return undefined;
  const n = Number(raw.replace(/[,$\s]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function parseGpa(raw: string | undefined): number | undefined {
  const n = parseNumber(raw);
  if (n == null || n < 0 || n > 4) return undefined;
  return n;
}

function parseStudentStatus(raw: string | undefined): "ACTIVE" | "GRADUATED" | "INACTIVE" {
  const v = (raw ?? "").trim().toUpperCase();
  if (v === "GRADUATED" || v === "GRADUATE") return "GRADUATED";
  if (v === "INACTIVE") return "INACTIVE";
  return "ACTIVE";
}

function parseImportedEnum<T extends string>(
  raw: string | undefined,
  allowed: readonly T[],
): T | null {
  if (!raw?.trim()) return null;
  const normalized = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return (allowed as readonly string[]).includes(normalized)
    ? (normalized as T)
    : null;
}

function parseImportedYear(raw: string | undefined): number | null {
  if (!raw?.trim()) return null;
  const n = Number(raw.trim());
  if (!Number.isInteger(n) || n < 1990 || n > 2100) return null;
  return n;
}

function parseImportedEthnicity(raw: string | undefined): string[] | null {
  if (!raw?.trim()) return null;
  const items = [
    ...new Set(
      raw
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  return items.length > 0 ? items : null;
}

function parseDate(raw: string | undefined): Date | undefined {
  if (!raw?.trim()) return undefined;
  const value = raw.trim();
  const iso = new Date(value);
  if (!Number.isNaN(iso.getTime()) && value.includes("-")) {
    return new Date(Date.UTC(iso.getUTCFullYear(), iso.getUTCMonth(), iso.getUTCDate()));
  }
  const serial = Number(value);
  if (Number.isFinite(serial) && serial > 20000 && serial < 80000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + serial);
    return epoch;
  }
  const parts = value.split(/[/.-]/).map((p) => p.trim());
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if ([a, b, c].every((n) => Number.isFinite(n))) {
      const year = c < 100 ? 2000 + c : c;
      const month = b <= 12 ? b - 1 : a - 1;
      const day = b <= 12 ? a : b;
      const date = new Date(Date.UTC(year, month, day));
      if (!Number.isNaN(date.getTime())) return date;
    }
  }
  return undefined;
}

function parseTermCode(raw: string | undefined): TermCode | undefined {
  if (!raw?.trim()) return undefined;
  const normalized = raw.trim().toUpperCase().replace(/\s+/g, "_");
  if (["FALL", "SPRING", "SUMMER", "WINTER"].includes(normalized)) return normalized as TermCode;
  const aliases: Record<string, TermCode> = { fall: "FALL", spring: "SPRING", summer: "SUMMER", winter: "WINTER" };
  return aliases[raw.trim().toLowerCase()];
}

function applyColumnMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  fieldKeys: string[],
): { line: number; values: Record<string, string> }[] {
  const keySet = new Set(fieldKeys);
  return rows
    .map((row, index) => {
      const values: Record<string, string> = {};
      let hasContent = false;
      for (const [fieldKey, header] of Object.entries(mapping)) {
        if (!keySet.has(fieldKey) || !header) continue;
        const value = (row[header] ?? "").trim();
        if (value) hasContent = true;
        values[fieldKey] = value;
      }
      if (!hasContent) return null;
      return { line: index + 2, values };
    })
    .filter((r): r is { line: number; values: Record<string, string> } => Boolean(r));
}

function summarize(rows: ImportRowPreview[]): ImportPreviewResult {
  return {
    rows,
    validCount: rows.filter((r) => r.status === "valid").length,
    warningCount: rows.filter((r) => r.status === "warning").length,
    errorCount: rows.filter((r) => r.status === "error").length,
  };
}

function generateSecurePassword(length = 12): string {
  const CHARSET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join("");
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

const STUDENT_FIELD_KEYS = [
  "email", "first_name", "last_name", "student_id", "phone",
  "university", "degree_program", "year_of_study", "graduation_year",
  "scholarship_type", "current_semester",
  "gpa", "religion", "ethnicity", "status", "bank_account_name", "bank_account_number",
  "bank_name", "promptpay_number",
];

async function previewStudents(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportPreviewResult> {
  const mapped = applyColumnMapping(rows, mapping, STUDENT_FIELD_KEYS);
  const previews: ImportRowPreview[] = [];

  for (const row of mapped) {
    const { line, values } = row;
    const email = values.email?.trim().toLowerCase();
    const firstName = values.first_name?.trim();
    const lastName = values.last_name?.trim();

    if (!email || !firstName || !lastName) {
      previews.push({ line, status: "error", message: "Email, first name, and last name are required." });
      continue;
    }

    const gpaRaw = values.gpa?.trim();
    const gpa = gpaRaw ? parseGpa(gpaRaw) : undefined;
    if (gpaRaw && gpa == null) {
      previews.push({ line, status: "error", message: "GPA must be a number between 0 and 4." });
      continue;
    }

    const messages: string[] = [];

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser) messages.push("Email already exists — row will be skipped on import.");

    const sid = values.student_id?.trim();
    if (sid) {
      const [dup] = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.studentId, sid))
        .limit(1);
      if (dup) messages.push("Student ID already in use — row will be skipped on import.");
    }

    const uniName = values.university?.trim();
    if (uniName) {
      const [uni] = await db
        .select({ id: universities.id })
        .from(universities)
        .where(ilike(universities.name, uniName))
        .limit(1);
      if (!uni) messages.push(`University "${uniName}" not found — will be created on import.`);
    }

    previews.push({
      line,
      status: messages.length > 0 ? "warning" : "valid",
      message: messages.join(" ") || undefined,
      data: { email, firstName, lastName, studentId: sid, gpa },
    });
  }

  return summarize(previews);
}

async function commitStudents(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  password?: string,
): Promise<ImportCommitResult> {
  const mapped = applyColumnMapping(rows, mapping, STUDENT_FIELD_KEYS);
  const tempPassword = password?.trim() || generateSecurePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of mapped) {
    const { line, values } = row;
    const email = values.email?.trim().toLowerCase();
    const firstName = values.first_name?.trim();
    const lastName = values.last_name?.trim();

    if (!email || !firstName || !lastName) {
      skipped++;
      errors.push(`Line ${line}: Email, first name, and last name are required.`);
      continue;
    }

    const gpaRaw = values.gpa?.trim();
    const gpa = gpaRaw ? parseGpa(gpaRaw) : undefined;
    if (gpaRaw && gpa == null) {
      skipped++;
      errors.push(`Line ${line}: GPA must be a number between 0 and 4.`);
      continue;
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser) {
      skipped++;
      errors.push(`Line ${line}: email already exists (${email}).`);
      continue;
    }

    const sid = values.student_id?.trim() || null;
    if (sid) {
      const [dup] = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.studentId, sid))
        .limit(1);
      if (dup) {
        skipped++;
        errors.push(`Line ${line}: student ID already exists (${sid}).`);
        continue;
      }
    }

    const uniName = values.university?.trim();
    let universityId: string | null = null;
    if (uniName) {
      const [existing] = await db
        .select({ id: universities.id })
        .from(universities)
        .where(ilike(universities.name, uniName))
        .limit(1);
      if (existing) {
        universityId = existing.id;
      } else {
        const newUniId = randomUUID();
        await db.insert(universities).values({ id: newUniId, name: uniName, isActive: true });
        universityId = newUniId;
      }
    }

    const status = parseStudentStatus(values.status);

    try {
      const userId = randomUUID();
      const studentDbId = randomUUID();
      const bankId = randomUUID();

      await db.insert(users).values({
        id: userId,
        email,
        passwordHash,
        role: "STUDENT",
        isActive: status === "ACTIVE",
      });

      await db.insert(students).values({
        id: studentDbId,
        userId,
        firstName,
        lastName,
        studentId: sid,
        phone: values.phone?.trim() || null,
        universityId,
        degreeProgram: values.degree_program?.trim() || null,
        yearOfStudy: values.year_of_study?.trim() || null,
        currentSemesterLabel: values.current_semester?.trim() || null,
        gpa: gpa != null ? String(gpa) : null,
        scholarshipType: parseImportedEnum(
          values.scholarship_type,
          SCHOLARSHIP_TYPE_VALUES,
        ) as ScholarshipType | null,
        graduationYear: parseImportedYear(values.graduation_year),
        religion: parseImportedEnum(values.religion, RELIGION_VALUES) as Religion | null,
        ethnicity: parseImportedEthnicity(values.ethnicity),
        status,
      });

      const hasBank =
        values.bank_account_name?.trim() ||
        values.bank_account_number?.trim() ||
        values.bank_name?.trim() ||
        values.promptpay_number?.trim();

      await db.insert(bankInformation).values({
        id: bankId,
        studentId: studentDbId,
        bankAccountName: values.bank_account_name?.trim() || null,
        bankAccountNumber: values.bank_account_number?.trim() || null,
        bankName: values.bank_name?.trim() || null,
        promptpayNumber: values.promptpay_number?.trim() || null,
      });

      void hasBank;
      created++;
    } catch (err: unknown) {
      skipped++;
      errors.push(`Line ${line}: could not create student (${email}).`);
      console.error("Student import error:", err);
    }
  }

  return { created, updated, skipped, errors, generatedPassword: created > 0 ? tempPassword : undefined };
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

const PAYMENT_FIELD_KEYS = [
  "request_id", "student_id", "student_email", "semester",
  "amount_paid", "payment_date", "payment_status", "internal_notes",
];

async function findPaymentRequest(values: Record<string, string>) {
  const requestId = values.request_id?.trim();
  const studentId = values.student_id?.trim();
  const studentEmail = values.student_email?.trim().toLowerCase();
  const semesterLabel = values.semester?.trim();

  if (requestId) {
    const [req] = await db
      .select({ id: tuitionPaymentRequests.id, studentId: tuitionPaymentRequests.studentId, semesterLabel: tuitionPaymentRequests.semesterLabel, status: tuitionPaymentRequests.status })
      .from(tuitionPaymentRequests)
      .where(eq(tuitionPaymentRequests.id, requestId))
      .limit(1);
    return req ?? null;
  }

  let studentDbId: string | null = null;

  if (studentId) {
    const [s] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.studentId, studentId))
      .limit(1);
    if (s) studentDbId = s.id;
  }

  if (!studentDbId && studentEmail) {
    const [u] = await db
      .select({ studentId: students.id })
      .from(users)
      .innerJoin(students, eq(students.userId, users.id))
      .where(eq(users.email, studentEmail))
      .limit(1);
    if (u) studentDbId = u.studentId;
  }

  if (!studentDbId || !semesterLabel) return null;

  const [req] = await db
    .select({ id: tuitionPaymentRequests.id, studentId: tuitionPaymentRequests.studentId, semesterLabel: tuitionPaymentRequests.semesterLabel, status: tuitionPaymentRequests.status })
    .from(tuitionPaymentRequests)
    .where(and(eq(tuitionPaymentRequests.studentId, studentDbId), ilike(tuitionPaymentRequests.semesterLabel, semesterLabel)))
    .orderBy(desc(tuitionPaymentRequests.submittedAt))
    .limit(1);

  return req ?? null;
}

async function previewPayments(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportPreviewResult> {
  const mapped = applyColumnMapping(rows, mapping, PAYMENT_FIELD_KEYS);
  const previews: ImportRowPreview[] = [];

  for (const row of mapped) {
    const { line, values } = row;
    const requestId = values.request_id?.trim();
    const studentId = values.student_id?.trim();
    const studentEmail = values.student_email?.trim();
    const semesterLabel = values.semester?.trim();

    if (!studentEmail && !studentId && !requestId) {
      previews.push({ line, status: "error", message: "Provide student email, student ID, or payment request ID." });
      continue;
    }

    if (!semesterLabel && !requestId) {
      previews.push({ line, status: "error", message: "Semester is required when request ID is not provided." });
      continue;
    }

    const amountPaid = parseNumber(values.amount_paid);
    if (amountPaid == null || amountPaid <= 0) {
      previews.push({ line, status: "error", message: "Amount paid must be a positive number." });
      continue;
    }

    const paymentDate = parseDate(values.payment_date);
    if (!paymentDate) {
      previews.push({ line, status: "error", message: "Payment date is invalid or missing." });
      continue;
    }

    const request = await findPaymentRequest(values);
    if (!request) {
      previews.push({
        line,
        status: "error",
        message: requestId ? "Payment request not found." : "Student or payment request not found.",
      });
      continue;
    }

    const [existing] = await db
      .select({ id: paymentHistory.id })
      .from(paymentHistory)
      .where(eq(paymentHistory.tuitionPaymentRequestId, request.id))
      .limit(1);

    let msg: string;
    if (existing && request.status === "PAID") {
      msg = "Payment record exists — will update amount and notes.";
    } else if (existing) {
      msg = "Payment record exists — will update payment and mark request as paid.";
    } else if (request.status !== "PAID") {
      msg = "Will record payment and mark request as paid.";
    } else {
      msg = "Will record payment.";
    }

    previews.push({
      line,
      status: "warning",
      message: msg,
      data: { resolvedRequestId: request.id, studentDbId: request.studentId, amountPaid, paymentDate },
    });
  }

  return summarize(previews);
}

async function commitPayments(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportCommitResult> {
  const mapped = applyColumnMapping(rows, mapping, PAYMENT_FIELD_KEYS);
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of mapped) {
    const { line, values } = row;
    const requestId = values.request_id?.trim();
    const studentId = values.student_id?.trim();
    const studentEmail = values.student_email?.trim();
    const semesterLabel = values.semester?.trim();

    if (!studentEmail && !studentId && !requestId) {
      skipped++;
      errors.push(`Line ${line}: Provide student email, student ID, or payment request ID.`);
      continue;
    }

    if (!semesterLabel && !requestId) {
      skipped++;
      errors.push(`Line ${line}: Semester is required when request ID is not provided.`);
      continue;
    }

    const amountPaid = parseNumber(values.amount_paid);
    if (amountPaid == null || amountPaid <= 0) {
      skipped++;
      errors.push(`Line ${line}: Amount paid must be a positive number.`);
      continue;
    }

    const paymentDate = parseDate(values.payment_date);
    if (!paymentDate) {
      skipped++;
      errors.push(`Line ${line}: Payment date is invalid or missing.`);
      continue;
    }

    const request = await findPaymentRequest(values);
    if (!request) {
      skipped++;
      errors.push(`Line ${line}: ${requestId ? "payment request not found." : "student or payment request not found."}`);
      continue;
    }

    const [existing] = await db
      .select({ id: paymentHistory.id })
      .from(paymentHistory)
      .where(eq(paymentHistory.tuitionPaymentRequestId, request.id))
      .limit(1);

    const paymentStatus = (values.payment_status?.trim().toUpperCase() || "PAID");
    const internalNotes = values.internal_notes?.trim() || null;

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(tuitionPaymentRequests)
          .set({ status: "PAID", paidAt: paymentDate, updatedAt: new Date() })
          .where(eq(tuitionPaymentRequests.id, request.id));

        if (existing) {
          await tx
            .update(paymentHistory)
            .set({ amountPaid: String(amountPaid), paymentDate, paymentStatus, internalNotes })
            .where(eq(paymentHistory.id, existing.id));
        } else {
          await tx.insert(paymentHistory).values({
            id: randomUUID(),
            studentId: request.studentId,
            tuitionPaymentRequestId: request.id,
            semesterLabel: request.semesterLabel,
            amountPaid: String(amountPaid),
            paymentDate,
            paymentStatus,
            internalNotes,
          });
        }
      });

      if (existing) updated++;
      else created++;
    } catch (err) {
      skipped++;
      errors.push(`Line ${line}: could not record payment.`);
      console.error("Payment import error:", err);
    }
  }

  return { created, updated, skipped, errors };
}

// ---------------------------------------------------------------------------
// Universities
// ---------------------------------------------------------------------------

const UNIVERSITY_FIELD_KEYS = [
  "id", "name", "city", "country", "address_line", "website", "summer", "status", "notes",
];

type UniversityData = {
  id?: string;
  name: string;
  city: string | null;
  country: string | null;
  addressLine: string | null;
  websiteUrl: string | null;
  hasSummerSemester: boolean;
  isActive: boolean;
  notes: string | null;
};

function parseUniversityRow(row: { line: number; values: Record<string, string> }) {
  const { line, values } = row;
  const name = values.name?.trim();
  if (!name) return { line, error: "Name is required." } as const;
  const website = values.website?.trim();
  if (website && !/^https?:\/\//i.test(website)) {
    return { line, error: "Website must be a valid URL (include http:// or https://)." } as const;
  }
  return {
    line,
    data: {
      id: values.id?.trim() || undefined,
      name,
      city: values.city?.trim() || null,
      country: values.country?.trim() || null,
      addressLine: values.address_line?.trim() || null,
      websiteUrl: website || null,
      hasSummerSemester: parseBoolean(values.summer) ?? true,
      isActive: parseBoolean(values.status) ?? true,
      notes: values.notes?.trim() || null,
    },
  } as const;
}

async function findExistingUniversity(id: string | undefined, name: string): Promise<{ id: string } | undefined> {
  if (id) {
    const [byId] = await db.select({ id: universities.id }).from(universities).where(eq(universities.id, id)).limit(1);
    if (byId) return byId;
  }
  const [byName] = await db.select({ id: universities.id }).from(universities).where(ilike(universities.name, name.trim())).limit(1);
  return byName;
}

async function previewUniversities(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportPreviewResult> {
  const mapped = applyColumnMapping(rows, mapping, UNIVERSITY_FIELD_KEYS);
  const previews: ImportRowPreview[] = [];
  const nameToLines = new Map<string, number[]>();

  for (const row of mapped) {
    const parsed = parseUniversityRow(row);
    if ("error" in parsed) {
      previews.push({ line: parsed.line, status: "error", message: parsed.error });
      continue;
    }
    const norm = parsed.data.name.toLowerCase();
    nameToLines.set(norm, [...(nameToLines.get(norm) ?? []), parsed.line]);
    previews.push({ line: parsed.line, status: "valid", data: parsed.data });
  }

  const final: ImportRowPreview[] = [];
  for (const preview of previews) {
    if (preview.status === "error" || !preview.data) { final.push(preview); continue; }
    const data = preview.data as UniversityData;
    const norm = data.name.toLowerCase();
    const dupLines = (nameToLines.get(norm) ?? []).filter((l) => l !== preview.line);
    const messages: string[] = [];
    if (dupLines.length > 0) messages.push(`Duplicate name in file (lines ${dupLines.join(", ")}) — only the last row is applied.`);

    const existing = await findExistingUniversity(data.id, data.name);

    if (existing) messages.push("University already exists — will be updated on import.");
    final.push({ ...preview, status: messages.length > 0 ? "warning" : "valid", message: messages.join(" ") || undefined });
  }

  return summarize(final);
}

async function commitUniversities(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<Pick<ImportCommitResult, "created" | "updated" | "skipped" | "errors">> {
  const preview = await previewUniversities(rows, mapping);
  const nameToLines = new Map<string, number>();
  for (const r of preview.rows) {
    if (r.status !== "error" && r.data) {
      const norm = (r.data as UniversityData).name.toLowerCase();
      nameToLines.set(norm, r.line);
    }
  }
  const validRows = preview.rows.filter(
    (r) => r.status !== "error" && r.data && nameToLines.get((r.data as UniversityData).name.toLowerCase()) === r.line,
  );

  let created = 0; let updated = 0; let skipped = 0;
  const errors: string[] = [];

  for (const row of validRows) {
    const data = row.data as UniversityData;
    const existing = await findExistingUniversity(data.id, data.name);

    if (existing) {
      await db.update(universities).set({ name: data.name, city: data.city, country: data.country, addressLine: data.addressLine, websiteUrl: data.websiteUrl, hasSummerSemester: data.hasSummerSemester, isActive: data.isActive, notes: data.notes, updatedAt: new Date() }).where(eq(universities.id, existing.id));
      updated++;
    } else {
      try {
        await db.insert(universities).values({ id: data.id || randomUUID(), name: data.name, city: data.city, country: data.country, addressLine: data.addressLine, websiteUrl: data.websiteUrl, hasSummerSemester: data.hasSummerSemester, isActive: data.isActive, notes: data.notes });
        created++;
      } catch {
        skipped++;
        errors.push(`Line ${row.line}: could not create university "${data.name}".`);
      }
    }
  }

  preview.rows.filter((r) => r.status === "error").forEach((r) => errors.push(`Line ${r.line}: ${r.message}`));
  return { created, updated, skipped, errors };
}

// ---------------------------------------------------------------------------
// University semesters
// ---------------------------------------------------------------------------

const SEMESTER_FIELD_KEYS = [
  "university_id", "university_name", "id", "academic_year", "term_code", "label", "start_date", "end_date", "status",
];

type SemesterData = {
  id?: string;
  universityId?: string;
  universityName?: string;
  academicYear: string;
  termCode: TermCode;
  label: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

type PendingUniversity = { id?: string; name?: string };

async function resolveUniversityId(
  universityId: string | undefined,
  universityName: string | undefined,
  pending?: PendingUniversity[],
): Promise<string | null> {
  if (pending?.length) {
    if (universityId) {
      const m = pending.find((u) => u.id === universityId);
      if (m) return m.id ?? "__pending__";
    }
    if (universityName) {
      const nameLower = universityName.toLowerCase();
      const m = pending.find((u) => u.name && u.name.toLowerCase() === nameLower);
      if (m) return m.id ?? "__pending__";
    }
  }

  if (universityId) {
    const [r] = await db.select({ id: universities.id }).from(universities).where(eq(universities.id, universityId)).limit(1);
    if (r) return r.id;
  }

  if (universityName) {
    const [r] = await db.select({ id: universities.id }).from(universities).where(ilike(universities.name, universityName)).limit(1);
    if (r) return r.id;
  }

  return null;
}

async function previewSemesters(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  pending?: PendingUniversity[],
): Promise<ImportPreviewResult> {
  const mapped = applyColumnMapping(rows, mapping, SEMESTER_FIELD_KEYS);
  const previews: ImportRowPreview[] = [];

  for (const row of mapped) {
    const { line, values } = row;
    const universityId = values.university_id?.trim();
    const universityName = values.university_name?.trim();
    if (!universityId && !universityName) {
      previews.push({ line, status: "error", message: "University ID or university name is required." });
      continue;
    }

    const label = values.label?.trim();
    const academicYear = values.academic_year?.trim();
    const termCode = parseTermCode(values.term_code);
    const startDate = parseDate(values.start_date);
    const endDate = parseDate(values.end_date);

    if (!label) { previews.push({ line, status: "error", message: "Label is required." }); continue; }
    if (!academicYear) { previews.push({ line, status: "error", message: "Academic year is required." }); continue; }
    if (!termCode) { previews.push({ line, status: "error", message: "Term must be FALL, SPRING, SUMMER, or WINTER." }); continue; }
    if (!startDate) { previews.push({ line, status: "error", message: "Start date is invalid or missing." }); continue; }
    if (!endDate) { previews.push({ line, status: "error", message: "End date is invalid or missing." }); continue; }
    if (endDate < startDate) { previews.push({ line, status: "error", message: "End date must be on or after start date." }); continue; }

    const resolvedUniId = await resolveUniversityId(universityId, universityName, pending);
    if (!resolvedUniId) {
      previews.push({ line, status: "error", message: "University not found — import universities first or check the ID/name." });
      continue;
    }

    const [existing] = values.id?.trim()
      ? await db.select({ id: universitySemesters.id }).from(universitySemesters).where(eq(universitySemesters.id, values.id.trim())).limit(1)
      : await db.select({ id: universitySemesters.id }).from(universitySemesters).where(and(eq(universitySemesters.universityId, resolvedUniId), ilike(universitySemesters.label, label), eq(universitySemesters.academicYear, academicYear))).limit(1);

    const messages = existing ? ["Semester already exists — will be updated on import."] : [];
    previews.push({
      line,
      status: messages.length > 0 ? "warning" : "valid",
      message: messages.join(" ") || undefined,
      data: { id: values.id?.trim() || undefined, universityId: resolvedUniId, academicYear, termCode, label, startDate, endDate, isActive: parseBoolean(values.status) ?? true },
    });
  }

  return summarize(previews);
}

async function commitSemesters(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<Pick<ImportCommitResult, "created" | "updated" | "skipped" | "errors">> {
  const preview = await previewSemesters(rows, mapping);
  const validRows = preview.rows.filter((r) => r.status !== "error" && r.data);
  let created = 0; let updated = 0; let skipped = 0;
  const errors: string[] = [];

  for (const row of validRows) {
    const data = row.data as SemesterData & { universityId: string };
    const [existing] = data.id
      ? await db.select({ id: universitySemesters.id }).from(universitySemesters).where(eq(universitySemesters.id, data.id)).limit(1)
      : await db.select({ id: universitySemesters.id }).from(universitySemesters).where(and(eq(universitySemesters.universityId, data.universityId), ilike(universitySemesters.label, data.label), eq(universitySemesters.academicYear, data.academicYear))).limit(1);

    const payload = { universityId: data.universityId, academicYear: data.academicYear, termCode: data.termCode, label: data.label, startDate: data.startDate, endDate: data.endDate, isActive: data.isActive };

    if (existing) {
      await db.update(universitySemesters).set({ ...payload, updatedAt: new Date() }).where(eq(universitySemesters.id, existing.id));
      updated++;
    } else {
      try {
        await db.insert(universitySemesters).values({ id: randomUUID(), ...payload });
        created++;
      } catch {
        skipped++;
        errors.push(`Line ${row.line}: could not create semester "${data.label}".`);
      }
    }
  }

  preview.rows.filter((r) => r.status === "error").forEach((r) => errors.push(`Line ${r.line}: ${r.message}`));
  return { created, updated, skipped, errors };
}

// ---------------------------------------------------------------------------
// Degree programs
// ---------------------------------------------------------------------------

const PROGRAM_FIELD_KEYS = ["university_id", "university_name", "id", "name", "status"];

type ProgramData = { id?: string; universityId?: string; universityName?: string; name: string; isActive: boolean };

async function previewPrograms(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  pending?: PendingUniversity[],
): Promise<ImportPreviewResult> {
  const mapped = applyColumnMapping(rows, mapping, PROGRAM_FIELD_KEYS);
  const previews: ImportRowPreview[] = [];

  for (const row of mapped) {
    const { line, values } = row;
    const universityId = values.university_id?.trim();
    const universityName = values.university_name?.trim();
    if (!universityId && !universityName) {
      previews.push({ line, status: "error", message: "University ID or university name is required." });
      continue;
    }

    const name = values.name?.trim();
    if (!name || name.length < 2) {
      previews.push({ line, status: "error", message: "Program name must be at least 2 characters." });
      continue;
    }

    const resolvedUniId = await resolveUniversityId(universityId, universityName, pending);
    if (!resolvedUniId) {
      previews.push({ line, status: "error", message: "University not found — import universities first or check the ID/name." });
      continue;
    }

    const [existing] = values.id?.trim()
      ? await db.select({ id: degreePrograms.id }).from(degreePrograms).where(eq(degreePrograms.id, values.id.trim())).limit(1)
      : await db.select({ id: degreePrograms.id }).from(degreePrograms).where(and(eq(degreePrograms.universityId, resolvedUniId), ilike(degreePrograms.name, name))).limit(1);

    const messages = existing ? ["Program already exists — will be updated on import."] : [];
    previews.push({
      line,
      status: messages.length > 0 ? "warning" : "valid",
      message: messages.join(" ") || undefined,
      data: { id: values.id?.trim() || undefined, universityId: resolvedUniId, name, isActive: parseBoolean(values.status) ?? true },
    });
  }

  return summarize(previews);
}

async function commitPrograms(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<Pick<ImportCommitResult, "created" | "updated" | "skipped" | "errors">> {
  const preview = await previewPrograms(rows, mapping);
  const validRows = preview.rows.filter((r) => r.status !== "error" && r.data);
  let created = 0; let updated = 0; let skipped = 0;
  const errors: string[] = [];

  for (const row of validRows) {
    const data = row.data as ProgramData & { universityId: string };
    const [existing] = data.id
      ? await db.select({ id: degreePrograms.id }).from(degreePrograms).where(eq(degreePrograms.id, data.id)).limit(1)
      : await db.select({ id: degreePrograms.id }).from(degreePrograms).where(and(eq(degreePrograms.universityId, data.universityId), ilike(degreePrograms.name, data.name))).limit(1);

    const payload = { universityId: data.universityId, name: data.name, isActive: data.isActive };

    if (existing) {
      await db.update(degreePrograms).set({ ...payload, updatedAt: new Date() }).where(eq(degreePrograms.id, existing.id));
      updated++;
    } else {
      try {
        await db.insert(degreePrograms).values({ id: randomUUID(), ...payload });
        created++;
      } catch {
        skipped++;
        errors.push(`Line ${row.line}: could not create program "${data.name}".`);
      }
    }
  }

  preview.rows.filter((r) => r.status === "error").forEach((r) => errors.push(`Line ${r.line}: ${r.message}`));
  return { created, updated, skipped, errors };
}

// ---------------------------------------------------------------------------
// Express routes
// ---------------------------------------------------------------------------

router.post("/import/preview", async (req, res) => {
  try {
    const { entity, rows, mapping, options } = req.body ?? {};

    if (!entity || !rows || !mapping) {
      res.status(400).json({ error: "entity, rows, and mapping are required." });
      return;
    }

    let result: unknown;

    if (entity === "students") {
      result = await previewStudents(rows, mapping);
    } else if (entity === "payments") {
      result = await previewPayments(rows, mapping);
    } else if (entity === "universities") {
      const universitiesPreview = await previewUniversities(rows, mapping);

      const pendingUniversities: PendingUniversity[] = rows.map((row: Record<string, string>) => ({
        id: (mapping["id"] ? row[mapping["id"]]?.trim() : undefined) || undefined,
        name: (mapping["name"] ? row[mapping["name"]]?.trim() : undefined) || undefined,
      })).filter((u: PendingUniversity) => u.name || u.id);

      const hasSemesters = options?.semesterRows?.length && options?.semesterMapping;
      const hasPrograms = options?.degreeProgramRows?.length && options?.degreeProgramMapping;

      const [semesterResult, programResult] = await Promise.all([
        hasSemesters ? previewSemesters(options.semesterRows, options.semesterMapping, pendingUniversities) : Promise.resolve(undefined),
        hasPrograms ? previewPrograms(options.degreeProgramRows, options.degreeProgramMapping, pendingUniversities) : Promise.resolve(undefined),
      ]);

      result = { ...universitiesPreview, semesters: semesterResult, degreePrograms: programResult };
    } else {
      res.status(400).json({ error: "Invalid entity." });
      return;
    }

    res.json(result);
  } catch (err) {
    console.error("POST /import/preview error", err);
    res.status(500).json({ error: "Import preview failed." });
  }
});

router.post("/import/commit", async (req, res) => {
  try {
    const { entity, rows, mapping, options } = req.body ?? {};

    if (!entity || !rows || !mapping) {
      res.status(400).json({ error: "entity, rows, and mapping are required." });
      return;
    }

    let result: unknown;

    if (entity === "students") {
      result = await commitStudents(rows, mapping, options?.password);
    } else if (entity === "payments") {
      result = await commitPayments(rows, mapping);
    } else if (entity === "universities") {
      const universityResult = await commitUniversities(rows, mapping);
      const hasSemesters = options?.semesterRows?.length && options?.semesterMapping;
      const hasPrograms = options?.degreeProgramRows?.length && options?.degreeProgramMapping;

      const [semesterResult, programResult] = await Promise.all([
        hasSemesters ? commitSemesters(options.semesterRows, options.semesterMapping) : Promise.resolve({ created: 0, updated: 0, skipped: 0, errors: [] as string[] }),
        hasPrograms ? commitPrograms(options.degreeProgramRows, options.degreeProgramMapping) : Promise.resolve({ created: 0, updated: 0, skipped: 0, errors: [] as string[] }),
      ]);

      result = {
        ...universityResult,
        ...(hasSemesters ? { semestersCreated: semesterResult.created, semestersUpdated: semesterResult.updated, semestersSkipped: semesterResult.skipped } : {}),
        ...(hasPrograms ? { degreeProgramsCreated: programResult.created, degreeProgramsUpdated: programResult.updated, degreeProgramsSkipped: programResult.skipped } : {}),
        errors: [...universityResult.errors, ...semesterResult.errors, ...programResult.errors],
      };
    } else {
      res.status(400).json({ error: "Invalid entity." });
      return;
    }

    res.json(result);
  } catch (err) {
    console.error("POST /import/commit error", err);
    res.status(500).json({ error: "Import commit failed." });
  }
});

export default router;
