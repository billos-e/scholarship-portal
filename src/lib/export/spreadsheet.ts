import * as XLSX from "xlsx";

export type ExportRow = Record<string, string | number | boolean | null>;

export function rowsToCsv(rows: ExportRow[]): string {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]!);
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) =>
      headers.map((h) => escapeCsvCell(row[h] ?? null)).join(","),
    ),
  ];
  return lines.join("\r\n");
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToXlsxBuffer(
  rows: ExportRow[],
  sheetName = "Export",
): Buffer {
  const worksheet =
    rows.length > 0
      ? XLSX.utils.json_to_sheet(rows)
      : XLSX.utils.aoa_to_sheet([[]]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return Buffer.from(
    XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
  );
}

export function contentDisposition(filename: string): string {
  const safe = filename.replace(/[^\w.-]+/g, "_");
  return `attachment; filename="${safe}"`;
}
