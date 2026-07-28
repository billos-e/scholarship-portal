import ExcelJS from "exceljs";
import JSZip from "jszip";

import type { ParsedSpreadsheet } from "./types";

const MAX_ROWS = 2000;
const SAMPLE_SIZE = 5;

function normalizeSheetName(value: string): string {
  return value.trim().toLowerCase();
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "object" && "richText" in value) {
    return (value as ExcelJS.CellRichTextValue).richText
      .map((rt) => rt.text)
      .join("");
  }
  if (typeof value === "object" && "result" in value) {
    return cellToString((value as ExcelJS.CellFormulaValue).result as ExcelJS.CellValue);
  }
  if (typeof value === "object" && "error" in value) {
    return "";
  }
  return String(value).trim();
}

function parseExcelJsWorksheet(worksheet: ExcelJS.Worksheet): ParsedSpreadsheet {
  const rowValues: Record<string, string>[] = [];
  let headers: string[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      // header row
      headers = (row.values as ExcelJS.CellValue[])
        .slice(1) // exceljs row.values is 1-indexed with undefined at 0
        .map((v) => cellToString(v).trim())
        .filter(Boolean);
      return;
    }
    if (rowValues.length >= MAX_ROWS) return;
    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      const cell = row.getCell(idx + 1);
      rowObj[header] = cellToString(cell.value);
    });
    rowValues.push(rowObj);
  });

  if (headers.length === 0) {
    return { headers: [], rows: [], sampleRows: [] };
  }

  return {
    headers,
    rows: rowValues,
    sampleRows: rowValues.slice(0, SAMPLE_SIZE),
  };
}

function findSheetName(
  worksheets: ExcelJS.Worksheet[],
  candidates: string[],
): ExcelJS.Worksheet | undefined {
  const normalizedCandidates = new Set(candidates.map(normalizeSheetName));
  return worksheets.find((ws) =>
    normalizedCandidates.has(normalizeSheetName(ws.name)),
  );
}

export type ParsedUniversitiesWorkbook = {
  universities: ParsedSpreadsheet;
  semesters?: ParsedSpreadsheet;
  degreePrograms?: ParsedSpreadsheet;
};

export async function parseSpreadsheetBuffer(
  buffer: Uint8Array,
  filename?: string,
): Promise<ParsedSpreadsheet> {
  if (filename && filename.toLowerCase().endsWith(".csv")) {
    const csvText = new TextDecoder().decode(buffer);
    return parseCsvText(csvText);
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer.buffer as ArrayBuffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { headers: [], rows: [], sampleRows: [] };
  }
  return parseExcelJsWorksheet(worksheet);
}

export async function parseUniversitiesImportBuffer(
  buffer: Uint8Array,
  filename?: string,
): Promise<ParsedUniversitiesWorkbook> {
  if (filename && filename.toLowerCase().endsWith(".csv")) {
    const csvText = new TextDecoder().decode(buffer);
    const parsed = parseCsvText(csvText);
    return { universities: parsed };
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer.buffer as ArrayBuffer);
  const worksheets = workbook.worksheets;

  if (worksheets.length === 0) {
    return {
      universities: { headers: [], rows: [], sampleRows: [] },
    };
  }

  const universitiesWorksheet =
    findSheetName(worksheets, ["universities", "university"]) ?? worksheets[0];

  const semestersWorksheet = findSheetName(worksheets, [
    "semesters",
    "semester",
    "university_semesters",
    "university semesters",
  ]);
  const degreeProgramsWorksheet = findSheetName(worksheets, [
    "degree programs",
    "degree_programs",
    "degree-programs",
    "programs",
    "program",
  ]);

  const universities = parseExcelJsWorksheet(universitiesWorksheet!);

  function parseOptionalSheet(
    ws: ExcelJS.Worksheet | undefined,
    skipWs: ExcelJS.Worksheet,
  ): ParsedSpreadsheet | undefined {
    if (!ws || ws === skipWs) return undefined;
    const parsed = parseExcelJsWorksheet(ws);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) return undefined;
    return parsed;
  }

  const semesters = parseOptionalSheet(semestersWorksheet, universitiesWorksheet!);
  const degreePrograms = parseOptionalSheet(
    degreeProgramsWorksheet,
    universitiesWorksheet!,
  );

  return {
    universities,
    ...(semesters ? { semesters } : {}),
    ...(degreePrograms ? { degreePrograms } : {}),
  };
}

// ── CSV parsing helpers ────────────────────────────────────────────────────────

function parseCsvText(csvText: string): ParsedSpreadsheet {
  const lines = csvText.split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return { headers: [], rows: [], sampleRows: [] };

  function splitCsvLine(line: string): string[] {
    const cells: string[] = [];
    let inQuotes = false;
    let cell = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cell += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          cells.push(cell);
          cell = "";
        } else {
          cell += ch;
        }
      }
    }
    cells.push(cell);
    return cells;
  }

  const headers = splitCsvLine(nonEmpty[0]!).map((h) => h.trim()).filter(Boolean);
  if (headers.length === 0) return { headers: [], rows: [], sampleRows: [] };

  const rows = nonEmpty
    .slice(1)
    .slice(0, MAX_ROWS)
    .map((line) => {
      const cells = splitCsvLine(line);
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = (cells[idx] ?? "").trim();
      });
      return rowObj;
    });

  return { headers, rows, sampleRows: rows.slice(0, SAMPLE_SIZE) };
}

function findZipEntry(
  zip: JSZip,
  candidates: string[],
): JSZip.JSZipObject | null {
  const normalizedCandidates = new Set(
    candidates.map((c) => normalizeSheetName(c)),
  );
  for (const [name, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const baseName = name.split("/").pop() ?? name;
    if (normalizedCandidates.has(normalizeSheetName(baseName))) {
      return file;
    }
  }
  return null;
}

async function parseCsvZipEntry(
  file: JSZip.JSZipObject,
): Promise<ParsedSpreadsheet> {
  const csvText = await file.async("string");
  return parseCsvText(csvText);
}

async function parseOptionalZipCsv(
  entry: JSZip.JSZipObject | null,
): Promise<ParsedSpreadsheet | undefined> {
  if (!entry) return undefined;
  const parsed = await parseCsvZipEntry(entry);
  if (parsed.headers.length === 0 || parsed.rows.length === 0) return undefined;
  return parsed;
}

export async function parseUniversitiesZipBuffer(
  buffer: Uint8Array,
): Promise<ParsedUniversitiesWorkbook> {
  const zip = await JSZip.loadAsync(buffer);
  const universitiesEntry = findZipEntry(zip, [
    "universities.csv",
    "university.csv",
  ]);
  const semestersEntry = findZipEntry(zip, ["semesters.csv", "semester.csv"]);
  const degreeProgramsEntry = findZipEntry(zip, [
    "degree-programs.csv",
    "degree_programs.csv",
    "degree programs.csv",
    "programs.csv",
    "program.csv",
  ]);

  if (!universitiesEntry) {
    return {
      universities: { headers: [], rows: [], sampleRows: [] },
    };
  }

  const universities = await parseCsvZipEntry(universitiesEntry);
  const [semesters, degreePrograms] = await Promise.all([
    parseOptionalZipCsv(semestersEntry),
    parseOptionalZipCsv(degreeProgramsEntry),
  ]);

  return {
    universities,
    ...(semesters ? { semesters } : {}),
    ...(degreePrograms ? { degreePrograms } : {}),
  };
}
