import JSZip from "jszip";
import * as XLSX from "xlsx";

export type ExportRow = Record<string, string | number | boolean | null>;

export type ExportColumn = {
  key: string;
  label: string;
};

export type ExportSheet = {
  name: string;
  columns: ExportColumn[];
  rows: ExportRow[];
  /** Appended to the base filename for CSV multi-file exports (e.g. "semesters"). */
  csvFilenameSuffix?: string;
};

function pickExportColumns(rows: ExportRow[], columnKeys: string[]): ExportRow[] {
  return rows.map((row) => {
    const picked: ExportRow = {};
    for (const key of columnKeys) {
      picked[key] = row[key] ?? null;
    }
    return picked;
  });
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows: ExportRow[], columns: ExportColumn[]): string {
  if (columns.length === 0) return "";

  const lines = [
    columns.map((column) => escapeCsvCell(column.label)).join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsvCell(row[column.key] ?? null)).join(","),
    ),
  ];
  return lines.join("\r\n");
}

export async function buildCsvZipBuffer(sheets: ExportSheet[]): Promise<Buffer> {
  const zip = new JSZip();

  for (const [index, sheet] of sheets.entries()) {
    const pickedRows = pickExportColumns(
      sheet.rows,
      sheet.columns.map((column) => column.key),
    );
    const csv = rowsToCsv(pickedRows, sheet.columns);
    const entryName = sheet.csvFilenameSuffix
      ? `${sheet.csvFilenameSuffix}.csv`
      : index === 0
        ? "universities.csv"
        : `${sheet.name.toLowerCase().replace(/\s+/g, "-")}.csv`;
    zip.file(entryName, csv);
  }

  return zip.generateAsync({ type: "nodebuffer" });
}

function rowsToWorksheet(rows: ExportRow[], columns: ExportColumn[]): XLSX.WorkSheet {
  const header = columns.map((column) => column.label);
  const data = rows.map((row) => columns.map((column) => row[column.key] ?? ""));
  return XLSX.utils.aoa_to_sheet([header, ...data]);
}

export function buildXlsxBuffer(sheets: ExportSheet[]): Buffer {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const pickedRows = pickExportColumns(
      sheet.rows,
      sheet.columns.map((column) => column.key),
    );
    const worksheet = rowsToWorksheet(pickedRows, sheet.columns);
    const safeName = sheet.name.slice(0, 31) || "Export";
    XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
  }

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
