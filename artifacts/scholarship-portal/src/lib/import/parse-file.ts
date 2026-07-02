import * as XLSX from "xlsx";
import JSZip from "jszip";

import type { ParsedSpreadsheet } from "./types";

const MAX_ROWS = 2000;
const SAMPLE_SIZE = 5;

function normalizeSheetName(value: string): string {
  return value.trim().toLowerCase();
}

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

function parseWorksheet(worksheet: XLSX.WorkSheet): ParsedSpreadsheet {
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  if (raw.length === 0) {
    return { headers: [], rows: [], sampleRows: [] };
  }

  const headers = Object.keys(raw[0] ?? {})
    .map((header) => header.trim())
    .filter(Boolean);
  const rows = raw.slice(0, MAX_ROWS).map((row) => {
    const normalized: Record<string, string> = {};
    for (const header of headers) {
      normalized[header] = cellToString(row[header]);
    }
    return normalized;
  });

  return {
    headers,
    rows,
    sampleRows: rows.slice(0, SAMPLE_SIZE),
  };
}

function findSheetName(
  sheetNames: string[],
  candidates: string[],
): string | undefined {
  const normalizedCandidates = new Set(candidates.map(normalizeSheetName));
  return sheetNames.find((name) =>
    normalizedCandidates.has(normalizeSheetName(name)),
  );
}

function parseOptionalSheet(
  workbook: XLSX.WorkBook,
  sheetName: string | undefined,
  universitiesSheetName: string,
): ParsedSpreadsheet | undefined {
  if (!sheetName || sheetName === universitiesSheetName) {
    return undefined;
  }

  const parsed = parseWorksheet(workbook.Sheets[sheetName]!);
  if (parsed.headers.length === 0 || parsed.rows.length === 0) {
    return undefined;
  }

  return parsed;
}

export type ParsedUniversitiesWorkbook = {
  universities: ParsedSpreadsheet;
  semesters?: ParsedSpreadsheet;
  degreePrograms?: ParsedSpreadsheet;
};

export function parseSpreadsheetBuffer(buffer: Buffer): ParsedSpreadsheet {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { headers: [], rows: [], sampleRows: [] };
  }

  return parseWorksheet(workbook.Sheets[sheetName]!);
}

export function parseUniversitiesImportBuffer(
  buffer: Buffer,
): ParsedUniversitiesWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    return {
      universities: { headers: [], rows: [], sampleRows: [] },
    };
  }

  const universitiesSheetName =
    findSheetName(sheetNames, ["universities", "university"]) ?? sheetNames[0];
  const semestersSheetName = findSheetName(sheetNames, [
    "semesters",
    "semester",
    "university_semesters",
    "university semesters",
  ]);
  const degreeProgramsSheetName = findSheetName(sheetNames, [
    "degree programs",
    "degree_programs",
    "degree-programs",
    "programs",
    "program",
  ]);

  const universities = parseWorksheet(
    workbook.Sheets[universitiesSheetName]!,
  );

  const semesters = parseOptionalSheet(
    workbook,
    semestersSheetName,
    universitiesSheetName,
  );
  const degreePrograms = parseOptionalSheet(
    workbook,
    degreeProgramsSheetName,
    universitiesSheetName,
  );

  return {
    universities,
    ...(semesters ? { semesters } : {}),
    ...(degreePrograms ? { degreePrograms } : {}),
  };
}

function findZipEntry(
  zip: JSZip,
  candidates: string[],
): JSZip.JSZipObject | null {
  const normalizedCandidates = new Set(candidates.map(normalizeSheetName));
  for (const [name, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const baseName = name.split("/").pop() ?? name;
    if (normalizedCandidates.has(normalizeSheetName(baseName))) {
      return file;
    }
  }
  return null;
}

async function parseCsvZipEntry(file: JSZip.JSZipObject): Promise<ParsedSpreadsheet> {
  const csvText = await file.async("string");
  const workbook = XLSX.read(csvText, { type: "string", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { headers: [], rows: [], sampleRows: [] };
  }
  return parseWorksheet(workbook.Sheets[sheetName]!);
}

async function parseOptionalZipCsv(
  entry: JSZip.JSZipObject | null,
): Promise<ParsedSpreadsheet | undefined> {
  if (!entry) return undefined;
  const parsed = await parseCsvZipEntry(entry);
  if (parsed.headers.length === 0 || parsed.rows.length === 0) {
    return undefined;
  }
  return parsed;
}

export async function parseUniversitiesZipBuffer(
  buffer: Buffer,
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
