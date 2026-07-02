import type { ImportEntity, UniversitiesImportPreview } from "./types";
import {
  commitPaymentsImport,
  previewPaymentsImport,
} from "./entities/payments";
import {
  commitStudentsImport,
  previewStudentsImport,
} from "./entities/students";
import {
  commitUniversitiesImport,
  previewUniversitiesImport,
} from "./entities/universities";
import {
  commitUniversitySemestersImport,
  previewUniversitySemestersImport,
} from "./entities/university-semesters";
import type { ColumnMapping, ImportCommitResult, ImportPreviewResult } from "./types";

export type UniversitiesImportOptions = {
  semesterRows?: Record<string, string>[];
  semesterMapping?: ColumnMapping;
};

export async function previewImport(
  entity: ImportEntity,
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  options?: UniversitiesImportOptions,
): Promise<ImportPreviewResult | UniversitiesImportPreview> {
  switch (entity) {
    case "universities": {
      const universities = await previewUniversitiesImport(rows, mapping);
      if (!options?.semesterRows?.length || !options.semesterMapping) {
        return universities;
      }
      const semesters = await previewUniversitySemestersImport(
        options.semesterRows,
        options.semesterMapping,
      );
      return { ...universities, semesters };
    }
    case "students":
      return previewStudentsImport(rows, mapping);
    case "payments":
      return previewPaymentsImport(rows, mapping);
  }
}

export async function commitImport(
  entity: ImportEntity,
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  options?: UniversitiesImportOptions & { password?: string },
): Promise<ImportCommitResult> {
  switch (entity) {
    case "universities": {
      const universityResult = await commitUniversitiesImport(rows, mapping);
      if (!options?.semesterRows?.length || !options.semesterMapping) {
        return universityResult;
      }

      const semesterResult = await commitUniversitySemestersImport(
        options.semesterRows,
        options.semesterMapping,
      );

      return {
        ...universityResult,
        semestersCreated: semesterResult.created,
        semestersUpdated: semesterResult.updated,
        semestersSkipped: semesterResult.skipped,
        errors: [...universityResult.errors, ...semesterResult.errors],
      };
    }
    case "students":
      return commitStudentsImport(rows, mapping, options?.password);
    case "payments":
      return commitPaymentsImport(rows, mapping);
  }
}
