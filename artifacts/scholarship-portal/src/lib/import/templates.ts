import ExcelJS from "exceljs";
import JSZip from "jszip";

import {
  DEGREE_PROGRAM_FIELDS,
  UNIVERSITY_SEMESTER_FIELDS,
  getImportFields,
} from "./fields";
import type { ImportEntity } from "./types";

type RowData = Record<string, string | number | boolean>;

const STUDENT_MOCK_ROWS: RowData[] = [
  {
    Email: "alice.johnson@example.com",
    "First name": "Alice",
    "Last name": "Johnson",
    "Student ID": "STU-1001",
    Phone: "+1-555-0101",
    University: "",
    "Degree program": "Computer Science",
    "Year of study": 2,
    "Current semester": "2024-2 (Fall)",
    GPA: 3.8,
    Status: "ACTIVE",
    "Bank account name": "Alice Johnson",
    "Bank account number": "1234567890",
    "Bank name": "Bangkok Bank",
    "PromptPay number": "0811234567",
  },
  {
    Email: "bob.smith@example.com",
    "First name": "Bob",
    "Last name": "Smith",
    "Student ID": "STU-1002",
    Phone: "+1-555-0102",
    University: "",
    "Degree program": "Business Administration",
    "Year of study": 3,
    "Current semester": "2024-2 (Fall)",
    GPA: 3.2,
    Status: "ACTIVE",
    "Bank account name": "Bob Smith",
    "Bank account number": "9876543210",
    "Bank name": "Kasikorn Bank",
    "PromptPay number": "0829876543",
  },
  {
    Email: "carol.lee@example.com",
    "First name": "Carol",
    "Last name": "Lee",
    "Student ID": "STU-1003",
    Phone: "+1-555-0103",
    University: "",
    "Degree program": "Engineering",
    "Year of study": 4,
    "Current semester": "2024-2 (Fall)",
    GPA: 3.5,
    Status: "GRADUATED",
    "Bank account name": "Carol Lee",
    "Bank account number": "1122334455",
    "Bank name": "SCB Bank",
    "PromptPay number": "",
  },
];

const UNIVERSITY_MOCK_ROWS: RowData[] = [
  {
    ID: "UNI-001",
    Name: "Chulalongkorn University",
    City: "Bangkok",
    Country: "Thailand",
    Address: "254 Phayathai Rd, Pathumwan",
    Website: "https://www.chula.ac.th",
    "Summer semester": true,
    "Active status": true,
    Notes: "Top-ranked university in Thailand",
  },
  {
    ID: "UNI-002",
    Name: "Mahidol University",
    City: "Nakhon Pathom",
    Country: "Thailand",
    Address: "999 Phuttamonthon 4 Rd",
    Website: "https://www.mahidol.ac.th",
    "Summer semester": false,
    "Active status": true,
    Notes: "",
  },
  {
    ID: "UNI-003",
    Name: "Thammasat University",
    City: "Bangkok",
    Country: "Thailand",
    Address: "2 Prachan Rd, Phra Nakhon",
    Website: "https://www.tu.ac.th",
    "Summer semester": true,
    "Active status": true,
    Notes: "Second oldest university in Thailand",
  },
];

const SEMESTER_MOCK_ROWS: RowData[] = [
  {
    "University ID": "UNI-001",
    University: "Chulalongkorn University",
    "Semester ID": "",
    "Academic year": "2024",
    Term: "SPRING",
    Label: "2024 Spring",
    "Start date": "2024-01-15",
    "End date": "2024-05-31",
    Status: true,
  },
  {
    "University ID": "UNI-001",
    University: "Chulalongkorn University",
    "Semester ID": "",
    "Academic year": "2024",
    Term: "FALL",
    Label: "2024 Fall",
    "Start date": "2024-08-19",
    "End date": "2024-12-20",
    Status: true,
  },
  {
    "University ID": "UNI-002",
    University: "Mahidol University",
    "Semester ID": "",
    "Academic year": "2024",
    Term: "SPRING",
    Label: "2024 Spring",
    "Start date": "2024-01-20",
    "End date": "2024-06-10",
    Status: true,
  },
];

const DEGREE_PROGRAM_MOCK_ROWS: RowData[] = [
  {
    "University ID": "UNI-001",
    University: "Chulalongkorn University",
    "Program ID": "",
    Name: "Computer Science",
    Status: true,
  },
  {
    "University ID": "UNI-001",
    University: "Chulalongkorn University",
    "Program ID": "",
    Name: "Business Administration",
    Status: true,
  },
  {
    "University ID": "UNI-002",
    University: "Mahidol University",
    "Program ID": "",
    Name: "Medicine",
    Status: true,
  },
];

const PAYMENT_MOCK_ROWS: RowData[] = [];

function getHeaders(entity: ImportEntity): string[] {
  return getImportFields(entity).map((f) => f.label);
}

function getMockRows(entity: ImportEntity): RowData[] {
  switch (entity) {
    case "students":
      return STUDENT_MOCK_ROWS;
    case "universities":
      return UNIVERSITY_MOCK_ROWS;
    case "payments":
      return PAYMENT_MOCK_ROWS;
  }
}

// ── CSV helpers ────────────────────────────────────────────────────────────────

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(headers: string[], rows: RowData[]): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) =>
      headers.map((h) => escapeCsvCell(row[h] ?? "")).join(","),
    ),
  ];
  return lines.join("\r\n");
}

// ── Excel helpers ──────────────────────────────────────────────────────────────

async function buildExcelBuffer(
  sheets: Array<{ name: string; headers: string[]; rows: RowData[] }>,
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  for (const sheet of sheets) {
    const ws = workbook.addWorksheet(sheet.name);
    ws.addRow(sheet.headers);
    for (const row of sheet.rows) {
      ws.addRow(sheet.headers.map((h) => row[h] ?? ""));
    }
  }
  return workbook.xlsx.writeBuffer();
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function generateCsvBlob(entity: ImportEntity): Blob {
  const headers = getHeaders(entity);
  const rows = getMockRows(entity);
  const csvString = rowsToCsv(headers, rows);
  return new Blob([csvString], { type: "text/csv" });
}

export async function generateExcelBlob(entity: ImportEntity): Promise<Blob> {
  if (entity === "universities") {
    const buffer = await buildExcelBuffer([
      {
        name: "Universities",
        headers: getHeaders("universities"),
        rows: UNIVERSITY_MOCK_ROWS,
      },
      {
        name: "Semesters",
        headers: UNIVERSITY_SEMESTER_FIELDS.map((f) => f.label),
        rows: SEMESTER_MOCK_ROWS,
      },
      {
        name: "Degree Programs",
        headers: DEGREE_PROGRAM_FIELDS.map((f) => f.label),
        rows: DEGREE_PROGRAM_MOCK_ROWS,
      },
    ]);
    return new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  const headers = getHeaders(entity);
  const rows = getMockRows(entity);
  const buffer = await buildExcelBuffer([{ name: "Sheet1", headers, rows }]);
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export async function generateUniversitiesZipBlob(): Promise<Blob> {
  const zip = new JSZip();

  zip.file(
    "universities.csv",
    rowsToCsv(getHeaders("universities"), UNIVERSITY_MOCK_ROWS),
  );
  zip.file(
    "semesters.csv",
    rowsToCsv(
      UNIVERSITY_SEMESTER_FIELDS.map((f) => f.label),
      SEMESTER_MOCK_ROWS,
    ),
  );
  zip.file(
    "degree-programs.csv",
    rowsToCsv(
      DEGREE_PROGRAM_FIELDS.map((f) => f.label),
      DEGREE_PROGRAM_MOCK_ROWS,
    ),
  );

  return zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
