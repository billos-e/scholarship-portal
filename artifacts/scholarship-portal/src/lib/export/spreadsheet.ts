import type { TableExportColumn } from "./table-columns";

export type ExportRow = Record<string, string | number | boolean | null>;

export type ExportSheet = {
  name: string;
  columns: TableExportColumn[];
  rows: ExportRow[];
  /** Appended to the base filename for CSV multi-file exports (e.g. "semesters"). */
  csvFilenameSuffix?: string;
};

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

export async function downloadExportFile(
  rows: ExportRow[],
  columns: TableExportColumn[],
  format: "csv" | "xlsx",
  filename: string,
  sheetName = "Export",
  extraSheets: ExportSheet[] = [],
): Promise<void> {
  const mainSheet: ExportSheet = { name: sheetName, columns, rows };
  const allSheets = [mainSheet, ...extraSheets];

  if (format === "csv") {
    if (extraSheets.length > 0) {
      const response = await fetch("/api/export/csv-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, sheets: allSheets }),
      });

      if (!response.ok) {
        throw new Error("CSV export failed. Please try again.");
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("CSV export produced an empty file. Please try again.");
      }

      triggerDownload(blob, `${filename}.zip`);
      return;
    }

    const pickedRows = pickExportColumns(
      rows,
      columns.map((column) => column.key),
    );
    const csv = rowsToCsv(pickedRows, columns);
    triggerDownload(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      `${filename}.csv`,
    );
    return;
  }

  const response = await fetch("/api/export/xlsx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, sheets: allSheets }),
  });

  if (!response.ok) {
    throw new Error("Excel export failed. Please try again.");
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("Excel export produced an empty file. Please try again.");
  }

  triggerDownload(blob, `${filename}.xlsx`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
