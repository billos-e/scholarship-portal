import JSZip from "jszip";
import ExcelJS from "exceljs";

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

export async function buildXlsxBuffer(
  sheets: ExportSheet[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const pickedRows = pickExportColumns(
      sheet.rows,
      sheet.columns.map((column) => column.key),
    );
    const safeName = sheet.name.slice(0, 31) || "Export";
    const worksheet = workbook.addWorksheet(safeName);
    worksheet.addRow(sheet.columns.map((column) => column.label));
    for (const row of pickedRows) {
      worksheet.addRow(sheet.columns.map((column) => row[column.key] ?? ""));
    }
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
