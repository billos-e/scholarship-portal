import * as XLSX from "xlsx";

import { pickExportColumns, type ExportRow, type ExportSheet } from "./spreadsheet";

type XlsxColumn = { key: string; label: string };

function rowsToWorksheet(
  rows: ExportRow[],
  columns: XlsxColumn[],
): XLSX.WorkSheet {
  const header = columns.map((column) => column.label);
  const data = rows.map((row) =>
    columns.map((column) => row[column.key] ?? ""),
  );
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
