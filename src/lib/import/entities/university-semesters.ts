import type { TermCode } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { applyColumnMapping } from "../apply-mapping";
import { getUniversitySemesterImportFields } from "../fields";
import { parseBoolean, parseDate } from "../parsers";
import type {
  ColumnMapping,
  ImportCommitResult,
  ImportPreviewResult,
  ImportRowPreview,
} from "../types";

type MappedRow = { line: number; values: Record<string, string> };

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

const TERM_ALIASES: Record<string, TermCode> = {
  fall: "FALL",
  spring: "SPRING",
  summer: "SUMMER",
  winter: "WINTER",
};

function parseTermCode(raw: string | undefined): TermCode | undefined {
  if (!raw?.trim()) return undefined;
  const normalized = raw.trim().toUpperCase().replace(/\s+/g, "_");
  if (["FALL", "SPRING", "SUMMER", "WINTER"].includes(normalized)) {
    return normalized as TermCode;
  }
  return TERM_ALIASES[raw.trim().toLowerCase()];
}

function parseSemesterRow(row: MappedRow) {
  const { line, values } = row;
  const universityId = values.university_id?.trim();
  const universityName = values.university_name?.trim();
  if (!universityId && !universityName) {
    return {
      line,
      error: "University ID or university name is required.",
    } as const;
  }

  const label = values.label?.trim();
  const academicYear = values.academic_year?.trim();
  const termCode = parseTermCode(values.term_code);
  const startDate = parseDate(values.start_date);
  const endDate = parseDate(values.end_date);

  if (!label) {
    return { line, error: "Label is required." } as const;
  }
  if (!academicYear) {
    return { line, error: "Academic year is required." } as const;
  }
  if (!termCode) {
    return { line, error: "Term must be FALL, SPRING, SUMMER, or WINTER." } as const;
  }
  if (!startDate) {
    return { line, error: "Start date is invalid or missing." } as const;
  }
  if (!endDate) {
    return { line, error: "End date is invalid or missing." } as const;
  }
  if (endDate < startDate) {
    return { line, error: "End date must be on or after start date." } as const;
  }

  return {
    line,
    data: {
      id: values.id?.trim() || undefined,
      universityId: universityId || undefined,
      universityName: universityName || undefined,
      academicYear,
      termCode,
      label,
      startDate,
      endDate,
      isActive: parseBoolean(values.status) ?? true,
    },
  } as const;
}

async function resolveUniversityId(data: SemesterData): Promise<string | null> {
  if (data.universityId) {
    const byId = await prisma.university.findUnique({
      where: { id: data.universityId },
      select: { id: true },
    });
    if (byId) return byId.id;
  }

  if (data.universityName) {
    const byName = await prisma.university.findFirst({
      where: { name: { equals: data.universityName, mode: "insensitive" } },
      select: { id: true },
    });
    if (byName) return byName.id;
  }

  return null;
}

export async function previewUniversitySemestersImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportPreviewResult> {
  const fields = getUniversitySemesterImportFields();
  const mapped = applyColumnMapping(rows, mapping, fields);
  const previews: ImportRowPreview[] = [];

  for (const row of mapped) {
    const parsed = parseSemesterRow(row);
    if ("error" in parsed) {
      previews.push({ line: parsed.line, status: "error", message: parsed.error });
      continue;
    }

    const data = parsed.data;
    const messages: string[] = [];
    const universityId = await resolveUniversityId(data);

    if (!universityId) {
      previews.push({
        line: parsed.line,
        status: "error",
        message: "University not found — import universities first or check the ID/name.",
      });
      continue;
    }

    const existing = data.id
      ? await prisma.universitySemester.findUnique({ where: { id: data.id } })
      : await prisma.universitySemester.findFirst({
          where: {
            universityId,
            label: { equals: data.label, mode: "insensitive" },
            academicYear: data.academicYear,
          },
        });

    if (existing) {
      messages.push("Semester already exists — will be updated on import.");
    }

    previews.push({
      line: parsed.line,
      status: messages.length > 0 ? "warning" : "valid",
      message: messages.join(" "),
      data: { ...data, universityId },
    });
  }

  return summarize(previews);
}

export async function commitUniversitySemestersImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<Pick<
  ImportCommitResult,
  "created" | "updated" | "skipped" | "errors"
>> {
  const preview = await previewUniversitySemestersImport(rows, mapping);
  const validRows = preview.rows.filter(
    (row) => row.status !== "error" && row.data,
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of validRows) {
    const data = row.data as SemesterData & { universityId: string };

    const existing = data.id
      ? await prisma.universitySemester.findUnique({ where: { id: data.id } })
      : await prisma.universitySemester.findFirst({
          where: {
            universityId: data.universityId,
            label: { equals: data.label, mode: "insensitive" },
            academicYear: data.academicYear,
          },
        });

    const payload = {
      universityId: data.universityId,
      academicYear: data.academicYear,
      termCode: data.termCode,
      label: data.label,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
    };

    if (existing) {
      await prisma.universitySemester.update({
        where: { id: existing.id },
        data: payload,
      });
      updated++;
      continue;
    }

    try {
      await prisma.universitySemester.create({ data: payload });
      created++;
    } catch {
      skipped++;
      errors.push(
        `Line ${row.line}: could not create semester "${data.label}" for university.`,
      );
    }
  }

  preview.rows
    .filter((row) => row.status === "error")
    .forEach((row) => errors.push(`Line ${row.line}: ${row.message}`));

  return { created, updated, skipped, errors };
}

function summarize(rows: ImportRowPreview[]): ImportPreviewResult {
  const validCount = rows.filter((row) => row.status === "valid").length;
  const warningCount = rows.filter((row) => row.status === "warning").length;
  const errorCount = rows.filter((row) => row.status === "error").length;
  return { rows, validCount, warningCount, errorCount };
}
