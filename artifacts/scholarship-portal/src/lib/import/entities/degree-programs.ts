import { prisma } from "@/lib/prisma";

import { applyColumnMapping } from "../apply-mapping";
import { getUniversityDegreeProgramImportFields } from "../fields";
import { parseBoolean } from "../parsers";
import type {
  ColumnMapping,
  ImportCommitResult,
  ImportPreviewResult,
  ImportRowPreview,
} from "../types";

type MappedRow = { line: number; values: Record<string, string> };

type ProgramData = {
  id?: string;
  universityId?: string;
  universityName?: string;
  name: string;
  isActive: boolean;
};

function parseProgramRow(row: MappedRow) {
  const { line, values } = row;
  const universityId = values.university_id?.trim();
  const universityName = values.university_name?.trim();
  if (!universityId && !universityName) {
    return {
      line,
      error: "University ID or university name is required.",
    } as const;
  }

  const name = values.name?.trim();
  if (!name) {
    return { line, error: "Program name is required." } as const;
  }
  if (name.length < 2) {
    return {
      line,
      error: "Program name must be at least 2 characters.",
    } as const;
  }

  return {
    line,
    data: {
      id: values.id?.trim() || undefined,
      universityId: universityId || undefined,
      universityName: universityName || undefined,
      name,
      isActive: parseBoolean(values.status) ?? true,
    },
  } as const;
}

async function resolveUniversityId(data: ProgramData): Promise<string | null> {
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

export async function previewDegreeProgramsImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportPreviewResult> {
  const fields = getUniversityDegreeProgramImportFields();
  const mapped = applyColumnMapping(rows, mapping, fields);
  const previews: ImportRowPreview[] = [];

  for (const row of mapped) {
    const parsed = parseProgramRow(row);
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
        message:
          "University not found — import universities first or check the ID/name.",
      });
      continue;
    }

    const existing = data.id
      ? await prisma.degreeProgram.findUnique({ where: { id: data.id } })
      : await prisma.degreeProgram.findFirst({
          where: {
            universityId,
            name: { equals: data.name, mode: "insensitive" },
          },
        });

    if (existing) {
      messages.push("Program already exists — will be updated on import.");
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

export async function commitDegreeProgramsImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<
  Pick<ImportCommitResult, "created" | "updated" | "skipped" | "errors">
> {
  const preview = await previewDegreeProgramsImport(rows, mapping);
  const validRows = preview.rows.filter(
    (row) => row.status !== "error" && row.data,
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of validRows) {
    const data = row.data as ProgramData & { universityId: string };

    const existing = data.id
      ? await prisma.degreeProgram.findUnique({ where: { id: data.id } })
      : await prisma.degreeProgram.findFirst({
          where: {
            universityId: data.universityId,
            name: { equals: data.name, mode: "insensitive" },
          },
        });

    const payload = {
      universityId: data.universityId,
      name: data.name,
      isActive: data.isActive,
    };

    if (existing) {
      await prisma.degreeProgram.update({
        where: { id: existing.id },
        data: payload,
      });
      updated++;
      continue;
    }

    try {
      await prisma.degreeProgram.create({ data: payload });
      created++;
    } catch {
      skipped++;
      errors.push(
        `Line ${row.line}: could not create program "${data.name}" for university.`,
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
