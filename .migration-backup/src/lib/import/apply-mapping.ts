import type { ColumnMapping, ImportFieldDef } from "./types";

export function applyColumnMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  fields: ImportFieldDef[],
): { line: number; values: Record<string, string> }[] {
  const fieldKeys = new Set(fields.map((f) => f.key));

  return rows
    .map((row, index) => {
      const values: Record<string, string> = {};
      let hasContent = false;

      for (const [fieldKey, header] of Object.entries(mapping)) {
        if (!fieldKeys.has(fieldKey) || !header) continue;
        const value = (row[header] ?? "").trim();
        if (value) hasContent = true;
        values[fieldKey] = value;
      }

      if (!hasContent) return null;

      return { line: index + 2, values };
    })
    .filter((row): row is { line: number; values: Record<string, string> } =>
      Boolean(row),
    );
}
