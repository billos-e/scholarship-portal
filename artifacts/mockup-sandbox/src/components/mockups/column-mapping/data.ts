export interface MockField {
  key: string;
  label: string;
  required?: boolean;
}

export const FIELDS: MockField[] = [
  { key: "email", label: "Email", required: true },
  { key: "first_name", label: "First name", required: true },
  { key: "last_name", label: "Last name", required: true },
  { key: "student_id", label: "Student ID" },
  { key: "phone", label: "Phone" },
  { key: "university", label: "University" },
  { key: "degree_program", label: "Degree program" },
  { key: "year_of_study", label: "Year of study" },
  { key: "current_semester", label: "Current semester" },
  { key: "gpa", label: "GPA" },
  { key: "status", label: "Status" },
  { key: "bank_account_name", label: "Bank account name" },
  { key: "bank_account_number", label: "Bank account number" },
  { key: "bank_name", label: "Bank name" },
  { key: "promptpay_number", label: "PromptPay number" },
];

export const HEADERS = [
  "Email",
  "First Name",
  "Last Name",
  "Student ID",
  "Phone",
  "University",
  "Program",
  "Year",
  "Semester",
  "GPA",
  "Status",
  "Bank Name",
  "Bank Account #",
  "Account Holder",
  "PromptPay",
];

const GUESS_MAP: Record<string, string> = {
  email: "Email",
  first_name: "First Name",
  last_name: "Last Name",
  student_id: "Student ID",
  phone: "Phone",
  university: "University",
  degree_program: "Program",
  year_of_study: "Year",
  current_semester: "Semester",
  gpa: "GPA",
  status: "Status",
  bank_account_name: "Account Holder",
  bank_account_number: "Bank Account #",
  bank_name: "Bank Name",
  promptpay_number: "PromptPay",
};

export function initialMapping(): Record<string, string> {
  return { ...GUESS_MAP };
}

export const SAMPLE_ROWS: Record<string, string>[] = [
  {
    "Email": "somchai.j@example.ac.th",
    "First Name": "Somchai",
    "Last Name": "Jaidee",
    "Student ID": "STU-2026-0001",
    "Phone": "081-234-5678",
    "University": "Chulalongkorn University",
    "Program": "Computer Engineering",
    "Year": "3",
    "Semester": "2025/2",
    "GPA": "3.62",
    "Status": "active",
  },
  {
    "Email": "nattaya.p@example.ac.th",
    "First Name": "Nattaya",
    "Last Name": "Phromma",
    "Student ID": "STU-2026-0002",
    "Phone": "089-876-5432",
    "University": "Mahidol University",
    "Program": "Biomedical Science",
    "Year": "2",
    "Semester": "2025/2",
    "GPA": "3.85",
    "Status": "active",
  },
];
