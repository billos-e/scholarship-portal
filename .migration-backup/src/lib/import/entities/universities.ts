import { prisma } from "@/lib/prisma";

import { applyColumnMapping } from "../apply-mapping";
import { getImportFields } from "../fields";
import { parseBoolean } from "../parsers";
import type {
  ImportCommitResult,
  ImportPreviewResult,
  ImportRowPreview,
  ColumnMapping,
} from "../types";

type MappedRow = { line: number; values: Record<string, string> };

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

function parseUniversityRow(row: MappedRow) {
  const { line, values } = row;
  const name = values.name?.trim();
  if (!name) {
    return {
      line,
      error: "Name is required.",
    } as const;
  }

  const website = values.website?.trim();
  if (website && !/^https?:\/\//i.test(website)) {
    return {
      line,
      error: "Website must be a valid URL (include http:// or https://).",
    } as const;
  }

  const id = values.id?.trim();

  return {
    line,
    data: {
      id: id || undefined,
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

function dedupeRowsByName(
  rows: ImportRowPreview[],
): ImportRowPreview[] {
  const lastByName = new Map<string, ImportRowPreview>();

  for (const row of rows) {
    if (row.status === "error" || !row.data) {
      continue;
    }

    const name = (row.data as UniversityData).name.toLowerCase();
    lastByName.set(name, row);
  }

  return rows.filter((row) => {
    if (row.status === "error" || !row.data) {
      return true;
    }

    const name = (row.data as UniversityData).name.toLowerCase();
    return lastByName.get(name)?.line === row.line;
  });
}

export async function previewUniversitiesImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportPreviewResult> {
  const fields = getImportFields("universities");
  const mapped = applyColumnMapping(rows, mapping, fields);
  const previews: ImportRowPreview[] = [];
  const nameToLines = new Map<string, number[]>();

  for (const row of mapped) {
    const parsed = parseUniversityRow(row);
    if ("error" in parsed) {
      previews.push({ line: parsed.line, status: "error", message: parsed.error });
      continue;
    }

    const normalizedName = parsed.data.name.toLowerCase();
    const lines = nameToLines.get(normalizedName) ?? [];
    lines.push(parsed.line);
    nameToLines.set(normalizedName, lines);

    previews.push({
      line: parsed.line,
      status: "valid",
      data: parsed.data,
    });
  }

  const finalPreviews: ImportRowPreview[] = [];

  for (const preview of previews) {
    if (preview.status === "error" || !preview.data) {
      finalPreviews.push(preview);
      continue;
    }

    const data = preview.data as UniversityData;
    const messages: string[] = [];
    const normalizedName = data.name.toLowerCase();
    const duplicateLines = (nameToLines.get(normalizedName) ?? []).filter(
      (line) => line !== preview.line,
    );

    if (duplicateLines.length > 0) {
      messages.push(
        `Duplicate name in file (lines ${duplicateLines.join(", ")}) — only the last row is applied.`,
      );
    }

    const existing = data.id
      ? await prisma.university.findUnique({ where: { id: data.id } })
      : await prisma.university.findFirst({
          where: { name: { equals: data.name, mode: "insensitive" } },
        });

    if (existing) {
      messages.push("University already exists — will be updated on import.");
    }

    finalPreviews.push({
      ...preview,
      status: messages.length > 0 ? "warning" : "valid",
      message: messages.join(" "),
    });
  }

  return summarize(finalPreviews);
}

export async function commitUniversitiesImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): Promise<ImportCommitResult> {
  const preview = await previewUniversitiesImport(rows, mapping);
  const validRows = dedupeRowsByName(
    preview.rows.filter((row) => row.status !== "error" && row.data),
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of validRows) {
    const data = row.data as UniversityData;

    const existing = data.id
      ? await prisma.university.findUnique({ where: { id: data.id } })
      : await prisma.university.findFirst({
          where: { name: { equals: data.name, mode: "insensitive" } },
        });

    if (existing) {
      await prisma.university.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          city: data.city,
          country: data.country,
          addressLine: data.addressLine,
          websiteUrl: data.websiteUrl,
          hasSummerSemester: data.hasSummerSemester,
          isActive: data.isActive,
          notes: data.notes,
        },
      });
      updated++;
      continue;
    }

    try {
      await prisma.university.create({ data });
      created++;
    } catch {
      skipped++;
      errors.push(`Line ${row.line}: could not create university "${data.name}".`);
    }
  }

  preview.rows
    .filter((row) => row.status === "error")
    .forEach((row) => errors.push(`Line ${row.line}: ${row.message}`));

  const duplicateSkipped = preview.rows.filter(
    (row) =>
      row.status !== "error" &&
      row.data &&
      !validRows.some((validRow) => validRow.line === row.line),
  ).length;

  return {
    created,
    updated,
    skipped: skipped + duplicateSkipped,
    errors,
  };
}

function summarize(rows: ImportRowPreview[]): ImportPreviewResult {
  const validCount = rows.filter((row) => row.status === "valid").length;
  const warningCount = rows.filter((row) => row.status === "warning").length;
  const errorCount = rows.filter((row) => row.status === "error").length;
  return { rows, validCount, warningCount, errorCount };
}
