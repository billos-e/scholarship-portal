import type { ImportEntity, UniversitiesImportPreview } from "./types";
import {
  commitDegreeProgramsImport,
  previewDegreeProgramsImport,
} from "./entities/degree-programs";
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
  degreeProgramRows?: Record<string, string>[];
  degreeProgramMapping?: ColumnMapping;
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
      const hasSemesters =
        options?.semesterRows?.length && options.semesterMapping;
      const hasPrograms =
        options?.degreeProgramRows?.length && options.degreeProgramMapping;

      if (!hasSemesters && !hasPrograms) {
        return universities;
      }

      const [semesters, degreePrograms] = await Promise.all([
        hasSemesters
          ? previewUniversitySemestersImport(
              options!.semesterRows!,
              options!.semesterMapping!,
            )
          : undefined,
        hasPrograms
          ? previewDegreeProgramsImport(
              options!.degreeProgramRows!,
              options!.degreeProgramMapping!,
            )
          : undefined,
      ]);

      return { ...universities, semesters, degreePrograms };
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
      const hasSemesters =
        options?.semesterRows?.length && options.semesterMapping;
      const hasPrograms =
        options?.degreeProgramRows?.length && options.degreeProgramMapping;

      if (!hasSemesters && !hasPrograms) {
        return universityResult;
      }

      const [semesterResult, degreeProgramResult] = await Promise.all([
        hasSemesters
          ? commitUniversitySemestersImport(
              options!.semesterRows!,
              options!.semesterMapping!,
            )
          : Promise.resolve({
              created: 0,
              updated: 0,
              skipped: 0,
              errors: [] as string[],
            }),
        hasPrograms
          ? commitDegreeProgramsImport(
              options!.degreeProgramRows!,
              options!.degreeProgramMapping!,
            )
          : Promise.resolve({
              created: 0,
              updated: 0,
              skipped: 0,
              errors: [] as string[],
            }),
      ]);

      return {
        ...universityResult,
        ...(hasSemesters
          ? {
              semestersCreated: semesterResult.created,
              semestersUpdated: semesterResult.updated,
              semestersSkipped: semesterResult.skipped,
            }
          : {}),
        ...(hasPrograms
          ? {
              degreeProgramsCreated: degreeProgramResult.created,
              degreeProgramsUpdated: degreeProgramResult.updated,
              degreeProgramsSkipped: degreeProgramResult.skipped,
            }
          : {}),
        errors: [
          ...universityResult.errors,
          ...semesterResult.errors,
          ...degreeProgramResult.errors,
        ],
      };
    }
    case "students":
      return commitStudentsImport(rows, mapping, options?.password);
    case "payments":
      return commitPaymentsImport(rows, mapping);
  }
}
