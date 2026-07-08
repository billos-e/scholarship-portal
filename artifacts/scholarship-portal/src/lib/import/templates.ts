import * as XLSX from "xlsx";
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

function buildWorksheet(headers: string[], rows: RowData[]): XLSX.WorkSheet {
  const data = [headers, ...rows.map((row) => headers.map((h) => row[h] ?? ""))];
  return XLSX.utils.aoa_to_sheet(data);
}

export function generateCsvBlob(entity: ImportEntity): Blob {
  const headers = getHeaders(entity);
  const rows = getMockRows(entity);
  const ws = buildWorksheet(headers, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const csvString = XLSX.utils.sheet_to_csv(ws);
  return new Blob([csvString], { type: "text/csv" });
}

export function generateExcelBlob(entity: ImportEntity): Blob {
  if (entity === "universities") {
    const wb = XLSX.utils.book_new();

    const uniHeaders = getHeaders("universities");
    const uniWs = buildWorksheet(uniHeaders, UNIVERSITY_MOCK_ROWS);
    XLSX.utils.book_append_sheet(wb, uniWs, "Universities");

    const semHeaders = UNIVERSITY_SEMESTER_FIELDS.map((f) => f.label);
    const semWs = buildWorksheet(semHeaders, SEMESTER_MOCK_ROWS);
    XLSX.utils.book_append_sheet(wb, semWs, "Semesters");

    const dpHeaders = DEGREE_PROGRAM_FIELDS.map((f) => f.label);
    const dpWs = buildWorksheet(dpHeaders, DEGREE_PROGRAM_MOCK_ROWS);
    XLSX.utils.book_append_sheet(wb, dpWs, "Degree Programs");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  const headers = getHeaders(entity);
  const rows = getMockRows(entity);
  const ws = buildWorksheet(headers, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export async function generateUniversitiesZipBlob(): Promise<Blob> {
  const zip = new JSZip();

  const uniHeaders = getHeaders("universities");
  const uniWs = buildWorksheet(uniHeaders, UNIVERSITY_MOCK_ROWS);
  const uniCsv = XLSX.utils.sheet_to_csv(uniWs);
  zip.file("universities.csv", uniCsv);

  const semHeaders = UNIVERSITY_SEMESTER_FIELDS.map((f) => f.label);
  const semWs = buildWorksheet(semHeaders, SEMESTER_MOCK_ROWS);
  const semCsv = XLSX.utils.sheet_to_csv(semWs);
  zip.file("semesters.csv", semCsv);

  const dpHeaders = DEGREE_PROGRAM_FIELDS.map((f) => f.label);
  const dpWs = buildWorksheet(dpHeaders, DEGREE_PROGRAM_MOCK_ROWS);
  const dpCsv = XLSX.utils.sheet_to_csv(dpWs);
  zip.file("degree-programs.csv", dpCsv);

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
