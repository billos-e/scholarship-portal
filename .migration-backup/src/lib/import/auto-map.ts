import type { ColumnMapping, ImportEntity, ImportFieldDef } from "./types";

export function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function suggestColumnMapping(
  headers: string[],
  fields: ImportFieldDef[],
): ColumnMapping {
  const headerByNormalized = new Map(
    headers.map((h) => [normalizeHeader(h), h]),
  );
  const usedHeaders = new Set<string>();
  const mapping: ColumnMapping = {};

  for (const field of fields) {
    const candidates = [
      field.key,
      field.label,
      ...(field.aliases ?? []),
    ].map(normalizeHeader);

    let matched: string | undefined;
    for (const candidate of candidates) {
      const header = headerByNormalized.get(candidate);
      if (header && !usedHeaders.has(header)) {
        matched = header;
        break;
      }
    }

    if (!matched) {
      for (const header of headers) {
        if (usedHeaders.has(header)) continue;
        const normalized = normalizeHeader(header);
        if (
          candidates.some(
            (c) => normalized.includes(c) || c.includes(normalized),
          )
        ) {
          matched = header;
          break;
        }
      }
    }

    if (matched) {
      mapping[field.key] = matched;
      usedHeaders.add(matched);
    }
  }

  return mapping;
}

export function getMissingRequiredFields(
  mapping: ColumnMapping,
  fields: ImportFieldDef[],
  entity?: ImportEntity,
): ImportFieldDef[] {
  if (entity === "payments") {
    return fields.filter((field) => field.required && !mapping[field.key]?.trim());
  }

  return fields.filter((field) => field.required && !mapping[field.key]?.trim());
}

export function getPaymentIdentityError(mapping: ColumnMapping): string | null {
  const hasRequestId = Boolean(mapping.request_id?.trim());
  const hasStudentId = Boolean(mapping.student_id?.trim());
  const hasEmail = Boolean(mapping.student_email?.trim());
  const hasSemester = Boolean(mapping.semester?.trim());

  if (hasRequestId) return null;
  if (hasStudentId && hasSemester) return null;
  if (hasEmail && hasSemester) return null;

  return "Map payment request ID, or student ID + semester, or student email + semester.";
}

export function getSemesterIdentityError(mapping: ColumnMapping): string | null {
  const hasUniversityId = Boolean(mapping.university_id?.trim());
  const hasUniversityName = Boolean(mapping.university_name?.trim());

  if (hasUniversityId || hasUniversityName) return null;

  return "Map university ID or university name for each semester row.";
}

export function getDegreeProgramIdentityError(
  mapping: ColumnMapping,
): string | null {
  const hasUniversityId = Boolean(mapping.university_id?.trim());
  const hasUniversityName = Boolean(mapping.university_name?.trim());

  if (hasUniversityId || hasUniversityName) return null;

  return "Map university ID or university name for each degree program row.";
}
