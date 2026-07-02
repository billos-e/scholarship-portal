"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { suggestColumnMapping, getMissingRequiredFields, getPaymentIdentityError, getSemesterIdentityError, getDegreeProgramIdentityError } from "@/lib/import/auto-map";
import { getImportFields, getUniversityDegreeProgramImportFields, getUniversitySemesterImportFields } from "@/lib/import/fields";
import { commitImport, previewImport } from "@/lib/import/index";
import {
  parseSpreadsheetBuffer,
  parseUniversitiesImportBuffer,
  parseUniversitiesZipBuffer,
} from "@/lib/import/parse-file";
import type {
  ColumnMapping,
  ImportCommitResult,
  ImportEntity,
  ImportPreviewResult,
  ImportSecondarySheet,
  ParsedSpreadsheet,
  UniversitiesImportPreview,
  ImportFieldDef,
} from "@/lib/import/types";

const entitySchema = z.enum(["students", "universities", "payments"]);

const mappingSchema = z.record(z.string(), z.string());

const rowsSchema = z.array(z.record(z.string(), z.string()));

export type ParseImportFileResult =
  | { error: string }
  | {
      headers: string[];
      sampleRows: Record<string, string>[];
      rows: Record<string, string>[];
      suggestedMapping: ColumnMapping;
      rowCount: number;
      semesterSheet?: ImportSecondarySheet;
      degreeProgramSheet?: ImportSecondarySheet;
    };

function toSecondarySheet(
  parsed: ParsedSpreadsheet,
  fields: ImportFieldDef[],
): ImportSecondarySheet {
  return {
    headers: parsed.headers,
    rows: parsed.rows,
    sampleRows: parsed.sampleRows,
    suggestedMapping: suggestColumnMapping(parsed.headers, fields),
    rowCount: parsed.rows.length,
  };
}

export async function parseImportFile(
  formData: FormData,
): Promise<ParseImportFileResult> {
  await requireAdmin();

  const entityRaw = formData.get("entity");
  const entityParsed = entitySchema.safeParse(entityRaw);
  if (!entityParsed.success) {
    return { error: "Invalid import type." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please upload a CSV or Excel file." };
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { error: "File is too large (max 5 MB)." };
  }

  const name = file.name.toLowerCase();
  if (
    !name.endsWith(".csv") &&
    !name.endsWith(".xlsx") &&
    !name.endsWith(".xls") &&
    !(entityParsed.data === "universities" && name.endsWith(".zip"))
  ) {
    return {
      error:
        entityParsed.data === "universities"
          ? "Supported formats: .csv, .xlsx, .xls, .zip"
          : "Supported formats: .csv, .xlsx, .xls",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let parsed: ParsedSpreadsheet;
  let semesterParsed: ParsedSpreadsheet | undefined;
  let degreeProgramParsed: ParsedSpreadsheet | undefined;

  if (entityParsed.data === "universities" && name.endsWith(".zip")) {
    const workbook = await parseUniversitiesZipBuffer(buffer);
    parsed = workbook.universities;
    semesterParsed = workbook.semesters;
    degreeProgramParsed = workbook.degreePrograms;
  } else if (entityParsed.data === "universities") {
    const workbook = parseUniversitiesImportBuffer(buffer);
    parsed = workbook.universities;
    semesterParsed = workbook.semesters;
    degreeProgramParsed = workbook.degreePrograms;
  } else {
    parsed = parseSpreadsheetBuffer(buffer);
  }

  if (parsed.headers.length === 0 || parsed.rows.length === 0) {
    return { error: "No data found in the file." };
  }

  const fields = getImportFields(entityParsed.data);
  const suggestedMapping = suggestColumnMapping(parsed.headers, fields);

  const semesterSheet =
    semesterParsed &&
    semesterParsed.headers.length > 0 &&
    semesterParsed.rows.length > 0
      ? toSecondarySheet(semesterParsed, getUniversitySemesterImportFields())
      : undefined;

  const degreeProgramSheet =
    degreeProgramParsed &&
    degreeProgramParsed.headers.length > 0 &&
    degreeProgramParsed.rows.length > 0
      ? toSecondarySheet(
          degreeProgramParsed,
          getUniversityDegreeProgramImportFields(),
        )
      : undefined;

  return {
    headers: parsed.headers,
    sampleRows: parsed.sampleRows,
    rows: parsed.rows,
    suggestedMapping,
    rowCount: parsed.rows.length,
    semesterSheet,
    degreeProgramSheet,
  };
}

export async function validateImportData(
  entity: ImportEntity,
  mapping: ColumnMapping,
  rows: Record<string, string>[],
  options?: {
    semesterMapping?: ColumnMapping;
    semesterRows?: Record<string, string>[];
    degreeProgramMapping?: ColumnMapping;
    degreeProgramRows?: Record<string, string>[];
  },
): Promise<{ error: string } | ImportPreviewResult | UniversitiesImportPreview> {
  await requireAdmin();

  const entityParsed = entitySchema.safeParse(entity);
  if (!entityParsed.success) {
    return { error: "Invalid import type." };
  }

  const mappingParsed = mappingSchema.safeParse(mapping);
  if (!mappingParsed.success) {
    return { error: "Invalid column mapping." };
  }

  const rowsParsed = rowsSchema.safeParse(rows);
  if (!rowsParsed.success) {
    return { error: "Invalid row data." };
  }

  const missing = getMissingRequiredFields(
    mappingParsed.data,
    getImportFields(entityParsed.data),
    entityParsed.data,
  );
  if (missing.length > 0) {
    return {
      error: `Map required fields: ${missing.map((f) => f.label).join(", ")}.`,
    };
  }

  if (entityParsed.data === "payments") {
    const identityError = getPaymentIdentityError(mappingParsed.data);
    if (identityError) {
      return { error: identityError };
    }
  }

  if (
    entityParsed.data === "universities" &&
    options?.semesterRows?.length &&
    options.semesterMapping
  ) {
    const semesterMappingParsed = mappingSchema.safeParse(options.semesterMapping);
    if (!semesterMappingParsed.success) {
      return { error: "Invalid semester column mapping." };
    }

    const missingSemesterFields = getMissingRequiredFields(
      semesterMappingParsed.data,
      getUniversitySemesterImportFields(),
    );
    if (missingSemesterFields.length > 0) {
      return {
        error: `Map required semester fields: ${missingSemesterFields.map((f) => f.label).join(", ")}.`,
      };
    }

    const semesterIdentityError = getSemesterIdentityError(
      semesterMappingParsed.data,
    );
    if (semesterIdentityError) {
      return { error: semesterIdentityError };
    }
  }

  if (
    entityParsed.data === "universities" &&
    options?.degreeProgramRows?.length &&
    options.degreeProgramMapping
  ) {
    const degreeProgramMappingParsed = mappingSchema.safeParse(
      options.degreeProgramMapping,
    );
    if (!degreeProgramMappingParsed.success) {
      return { error: "Invalid degree program column mapping." };
    }

    const missingProgramFields = getMissingRequiredFields(
      degreeProgramMappingParsed.data,
      getUniversityDegreeProgramImportFields(),
    );
    if (missingProgramFields.length > 0) {
      return {
        error: `Map required degree program fields: ${missingProgramFields.map((f) => f.label).join(", ")}.`,
      };
    }

    const degreeProgramIdentityError = getDegreeProgramIdentityError(
      degreeProgramMappingParsed.data,
    );
    if (degreeProgramIdentityError) {
      return { error: degreeProgramIdentityError };
    }
  }

  return previewImport(
    entityParsed.data,
    rowsParsed.data,
    mappingParsed.data,
    {
      semesterRows: options?.semesterRows,
      semesterMapping: options?.semesterMapping,
      degreeProgramRows: options?.degreeProgramRows,
      degreeProgramMapping: options?.degreeProgramMapping,
    },
  );
}

export async function commitImportData(
  entity: ImportEntity,
  mapping: ColumnMapping,
  rows: Record<string, string>[],
  options?: {
    password?: string;
    semesterMapping?: ColumnMapping;
    semesterRows?: Record<string, string>[];
    degreeProgramMapping?: ColumnMapping;
    degreeProgramRows?: Record<string, string>[];
  },
): Promise<{ error: string } | ImportCommitResult> {
  await requireAdmin();

  const entityParsed = entitySchema.safeParse(entity);
  if (!entityParsed.success) {
    return { error: "Invalid import type." };
  }

  const mappingParsed = mappingSchema.safeParse(mapping);
  if (!mappingParsed.success) {
    return { error: "Invalid column mapping." };
  }

  const rowsParsed = rowsSchema.safeParse(rows);
  if (!rowsParsed.success) {
    return { error: "Invalid row data." };
  }

  const missing = getMissingRequiredFields(
    mappingParsed.data,
    getImportFields(entityParsed.data),
    entityParsed.data,
  );
  if (missing.length > 0) {
    return {
      error: `Map required fields: ${missing.map((f) => f.label).join(", ")}.`,
    };
  }

  if (entityParsed.data === "payments") {
    const identityError = getPaymentIdentityError(mappingParsed.data);
    if (identityError) {
      return { error: identityError };
    }
  }

  if (
    entityParsed.data === "universities" &&
    options?.semesterRows?.length &&
    options?.semesterMapping
  ) {
    const semesterMappingParsed = mappingSchema.safeParse(options.semesterMapping);
    if (!semesterMappingParsed.success) {
      return { error: "Invalid semester column mapping." };
    }

    const missingSemesterFields = getMissingRequiredFields(
      semesterMappingParsed.data,
      getUniversitySemesterImportFields(),
    );
    if (missingSemesterFields.length > 0) {
      return {
        error: `Map required semester fields: ${missingSemesterFields.map((f) => f.label).join(", ")}.`,
      };
    }

    const semesterIdentityError = getSemesterIdentityError(
      semesterMappingParsed.data,
    );
    if (semesterIdentityError) {
      return { error: semesterIdentityError };
    }
  }

  if (
    entityParsed.data === "universities" &&
    options?.degreeProgramRows?.length &&
    options?.degreeProgramMapping
  ) {
    const degreeProgramMappingParsed = mappingSchema.safeParse(
      options.degreeProgramMapping,
    );
    if (!degreeProgramMappingParsed.success) {
      return { error: "Invalid degree program column mapping." };
    }

    const missingProgramFields = getMissingRequiredFields(
      degreeProgramMappingParsed.data,
      getUniversityDegreeProgramImportFields(),
    );
    if (missingProgramFields.length > 0) {
      return {
        error: `Map required degree program fields: ${missingProgramFields.map((f) => f.label).join(", ")}.`,
      };
    }

    const degreeProgramIdentityError = getDegreeProgramIdentityError(
      degreeProgramMappingParsed.data,
    );
    if (degreeProgramIdentityError) {
      return { error: degreeProgramIdentityError };
    }
  }

  const result = await commitImport(
    entityParsed.data,
    rowsParsed.data,
    mappingParsed.data,
    {
      password: options?.password,
      semesterRows: options?.semesterRows,
      semesterMapping: options?.semesterMapping,
      degreeProgramRows: options?.degreeProgramRows,
      degreeProgramMapping: options?.degreeProgramMapping,
    },
  );

  revalidatePath("/admin/students");
  revalidatePath("/admin/universities");
  revalidatePath("/admin/requests");
  revalidatePath("/student/profile/edit");

  return result;
}
