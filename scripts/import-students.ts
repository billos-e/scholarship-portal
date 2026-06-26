/**
 * Import students from a client spreadsheet (CSV or Excel).
 *
 * Usage:
 *   npx tsx scripts/import-students.ts --file path/to/students.xlsx --dry-run
 *   npx tsx scripts/import-students.ts --file path/to/students.csv --password "TempPass123"
 *   npx tsx scripts/import-students.ts --file data.xlsx --mapping scripts/import-mapping.example.json
 *
 * Column mapping: pass --mapping with a JSON file, or rely on built-in aliases.
 * See scripts/import-mapping.example.json for the format.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient, type StudentStatus } from "@prisma/client";
import * as XLSX from "xlsx";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

type ColumnMapping = {
  email: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  phone?: string;
  university?: string;
  degreeProgram?: string;
  yearOfStudy?: string;
  currentSemesterLabel?: string;
  gpa?: string;
  status?: string;
};

const DEFAULT_ALIASES: Record<keyof ColumnMapping, string[]> = {
  email: ["email", "e-mail", "e_mail", "student email", "student_email"],
  firstName: ["first_name", "firstname", "first name", "given name", "given_name"],
  lastName: ["last_name", "lastname", "last name", "surname", "family name"],
  studentId: ["student_id", "student id", "id", "matricule", "student number"],
  phone: ["phone", "telephone", "mobile", "phone number", "phone_number"],
  university: ["university", "school", "institution", "college"],
  degreeProgram: [
    "degree_program",
    "degree program",
    "program",
    "major",
    "field of study",
  ],
  yearOfStudy: ["year_of_study", "year of study", "year", "class year"],
  currentSemesterLabel: [
    "current_semester",
    "current semester",
    "semester",
    "current_semester_label",
  ],
  gpa: ["gpa", "grade point average", "grade_point_average"],
  status: ["status", "student status", "student_status"],
};

type ImportRow = {
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
};

type ImportResult = {
  ok: ImportRow[];
  skipped: { line: number; reason: string }[];
  errors: { line: number; reason: string }[];
};

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function resolveMapping(
  headers: string[],
  custom?: Partial<ColumnMapping>,
): ColumnMapping | null {
  const headerSet = new Map(headers.map((h) => [normalizeHeader(h), h]));

  function pick(field: keyof ColumnMapping, required = false): string | undefined {
    if (custom?.[field]) {
      const exact = headerSet.get(normalizeHeader(custom[field]!));
      if (exact) return exact;
      if (required) return undefined;
    }
    for (const alias of DEFAULT_ALIASES[field] ?? []) {
      const match = headerSet.get(normalizeHeader(alias));
      if (match) return match;
    }
    return required ? undefined : custom?.[field];
  }

  const email = pick("email", true);
  const firstName = pick("firstName", true);
  const lastName = pick("lastName", true);
  if (!email || !firstName || !lastName) return null;

  return {
    email,
    firstName,
    lastName,
    studentId: pick("studentId"),
    phone: pick("phone"),
    university: pick("university"),
    degreeProgram: pick("degreeProgram"),
    yearOfStudy: pick("yearOfStudy"),
    currentSemesterLabel: pick("currentSemesterLabel"),
    gpa: pick("gpa"),
    status: pick("status"),
  };
}

function parseStatus(raw: unknown): StudentStatus {
  const value = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (value === "GRADUATED" || value === "GRADUATE") return "GRADUATED";
  if (value === "INACTIVE") return "INACTIVE";
  return "ACTIVE";
}

function parseGpa(raw: unknown): number | undefined {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function readSpreadsheet(filePath: string): Record<string, unknown>[] {
  const abs = path.resolve(filePath);
  const workbook = XLSX.read(readFileSync(abs), { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[sheetName]!,
    { defval: "" },
  );
}

function parseRows(
  rawRows: Record<string, unknown>[],
  mapping: ColumnMapping,
): ImportResult {
  const result: ImportResult = { ok: [], skipped: [], errors: [] };

  rawRows.forEach((row, index) => {
    const line = index + 2; // header is line 1
    const email = String(row[mapping.email] ?? "")
      .trim()
      .toLowerCase();
    const firstName = String(row[mapping.firstName] ?? "").trim();
    const lastName = String(row[mapping.lastName] ?? "").trim();

    if (!email && !firstName && !lastName) return;

    if (!email || !firstName || !lastName) {
      result.errors.push({
        line,
        reason: "Missing required email, first name, or last name.",
      });
      return;
    }

    const studentId = mapping.studentId
      ? String(row[mapping.studentId] ?? "").trim() || undefined
      : undefined;

    result.ok.push({
      line,
      email,
      firstName,
      lastName,
      studentId,
      phone: mapping.phone
        ? String(row[mapping.phone] ?? "").trim() || undefined
        : undefined,
      university: mapping.university
        ? String(row[mapping.university] ?? "").trim() || undefined
        : undefined,
      degreeProgram: mapping.degreeProgram
        ? String(row[mapping.degreeProgram] ?? "").trim() || undefined
        : undefined,
      yearOfStudy: mapping.yearOfStudy
        ? String(row[mapping.yearOfStudy] ?? "").trim() || undefined
        : undefined,
      currentSemesterLabel: mapping.currentSemesterLabel
        ? String(row[mapping.currentSemesterLabel] ?? "").trim() || undefined
        : undefined,
      gpa: mapping.gpa ? parseGpa(row[mapping.gpa]) : undefined,
      status: mapping.status ? parseStatus(row[mapping.status]) : "ACTIVE",
    });
  });

  return result;
}

async function ensureUniversity(name: string): Promise<string> {
  const existing = await prisma.university.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return existing.id;

  const created = await prisma.university.create({
    data: { name, isActive: true },
  });
  return created.id;
}

async function importRows(
  rows: ImportRow[],
  password: string,
  dryRun: boolean,
): Promise<{ created: number; skipped: number; errors: string[] }> {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];
  const passwordHash = dryRun ? "" : await hashPassword(password);

  for (const row of rows) {
    const existingUser = await prisma.user.findUnique({
      where: { email: row.email },
    });
    if (existingUser) {
      skipped++;
      errors.push(`Line ${row.line}: email already exists (${row.email}).`);
      continue;
    }

    if (row.studentId) {
      const dup = await prisma.student.findUnique({
        where: { studentId: row.studentId },
      });
      if (dup) {
        skipped++;
        errors.push(
          `Line ${row.line}: student ID already exists (${row.studentId}).`,
        );
        continue;
      }
    }

    if (dryRun) {
      created++;
      continue;
    }

    const universityId = row.university
      ? await ensureUniversity(row.university)
      : null;

    await prisma.user.create({
      data: {
        email: row.email,
        passwordHash,
        role: "STUDENT",
        isActive: row.status === "ACTIVE",
        student: {
          create: {
            firstName: row.firstName,
            lastName: row.lastName,
            studentId: row.studentId ?? null,
            phone: row.phone ?? null,
            universityId,
            degreeProgram: row.degreeProgram ?? null,
            yearOfStudy: row.yearOfStudy ?? null,
            currentSemesterLabel: row.currentSemesterLabel ?? null,
            gpa: row.gpa ?? null,
            status: row.status,
            bankInformation: { create: {} },
          },
        },
      },
    });
    created++;
  }

  return { created, skipped, errors };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args.file as string | undefined;
  const mappingPath = args.mapping as string | undefined;
  const password = (args.password as string | undefined) ?? "ChangeMe123!";
  const dryRun = Boolean(args.dryRun);

  if (!file) {
    console.error(
      "Usage: npx tsx scripts/import-students.ts --file <path> [--password <temp>] [--mapping <json>] [--dry-run]",
    );
    process.exit(1);
  }

  const customMapping = mappingPath
    ? (JSON.parse(readFileSync(path.resolve(mappingPath), "utf8")) as Partial<ColumnMapping>)
    : undefined;

  const rawRows = readSpreadsheet(file);
  if (rawRows.length === 0) {
    console.error("No rows found in the spreadsheet.");
    process.exit(1);
  }

  const headers = Object.keys(rawRows[0] ?? {});
  const mapping = resolveMapping(headers, customMapping);
  if (!mapping) {
    console.error(
      "Could not map required columns (email, first name, last name).",
    );
    console.error("Headers found:", headers.join(", "));
    process.exit(1);
  }

  console.log("Column mapping:", mapping);
  const parsed = parseRows(rawRows, mapping);
  console.log(
    `Parsed ${parsed.ok.length} row(s); ${parsed.errors.length} parse error(s).`,
  );
  parsed.errors.forEach((e) => console.warn(`  Line ${e.line}: ${e.reason}`));

  if (parsed.ok.length === 0) {
    process.exit(1);
  }

  if (dryRun) {
    console.log("\nDry run — no database writes.");
  }

  const result = await importRows(parsed.ok, password, dryRun);
  console.log(`\n${dryRun ? "Would create" : "Created"}: ${result.created}`);
  console.log(`Skipped: ${result.skipped}`);
  if (result.errors.length > 0) {
    console.log("\nIssues:");
    result.errors.forEach((msg) => console.log(`  - ${msg}`));
  }
  if (!dryRun && result.created > 0) {
    console.log(`\nDefault password for new accounts: ${password}`);
    console.log("Ask students to change it on first login.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
