import * as XLSX from "xlsx";

import type { TableExportColumn } from "./table-columns";

export type ExportRow = Record<string, string | number | boolean | null>;

export function pickExportColumns(
  rows: ExportRow[],
  columnKeys: string[],
): ExportRow[] {
  return rows.map((row) => {
    const picked: ExportRow = {};
    for (const key of columnKeys) {
      picked[key] = row[key] ?? null;
    }
    return picked;
  });
}

export function rowsToCsv(
  rows: ExportRow[],
  columns: TableExportColumn[],
): string {
  if (columns.length === 0) return "";

  const lines = [
    columns.map((column) => escapeCsvCell(column.label)).join(","),
    ...rows.map((row) =>
      columns
        .map((column) => escapeCsvCell(row[column.key] ?? null))
        .join(","),
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

export function rowsToXlsxArray(
  rows: ExportRow[],
  columns: TableExportColumn[],
  sheetName = "Export",
): Uint8Array {
  const sheetRows = rows.map((row) => {
    const labeled: Record<string, string | number | boolean | null> = {};
    for (const column of columns) {
      labeled[column.label] = row[column.key] ?? null;
    }
    return labeled;
  });

  const worksheet =
    sheetRows.length > 0
      ? XLSX.utils.json_to_sheet(sheetRows)
      : XLSX.utils.aoa_to_sheet([columns.map((column) => column.label)]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return Uint8Array.from(bytes as number[]);
}

export function downloadExportFile(
  rows: ExportRow[],
  columns: TableExportColumn[],
  format: "csv" | "xlsx",
  filename: string,
  sheetName = "Export",
) {
  const selectedColumns = columns;
  const pickedRows = pickExportColumns(
    rows,
    selectedColumns.map((column) => column.key),
  );

  if (format === "csv") {
    const csv = rowsToCsv(pickedRows, selectedColumns);
    triggerDownload(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      `${filename}.csv`,
    );
    return;
  }

  const buffer = rowsToXlsxArray(pickedRows, selectedColumns, sheetName);
  triggerDownload(
    new Blob([Uint8Array.from(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}.xlsx`,
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
