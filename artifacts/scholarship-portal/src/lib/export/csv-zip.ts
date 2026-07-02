import JSZip from "jszip";

import { pickExportColumns, rowsToCsv, type ExportSheet } from "./spreadsheet";

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
