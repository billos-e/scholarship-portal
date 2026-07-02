import type { ImportEntity, ImportFieldDef } from "./types";

const STUDENT_FIELDS: ImportFieldDef[] = [
  {
    key: "email",
    label: "Email",
    required: true,
    aliases: ["e-mail", "e_mail", "student email", "student_email"],
  },
  {
    key: "first_name",
    label: "First name",
    required: true,
    aliases: ["first name", "firstname", "given name", "given_name"],
  },
  {
    key: "last_name",
    label: "Last name",
    required: true,
    aliases: ["last name", "lastname", "surname", "family name"],
  },
  {
    key: "student_id",
    label: "Student ID",
    aliases: ["student id", "matricule", "student number"],
  },
  { key: "phone", label: "Phone", aliases: ["telephone", "mobile", "phone number"] },
  {
    key: "university",
    label: "University",
    aliases: ["school", "institution", "college"],
  },
  {
    key: "degree_program",
    label: "Degree program",
    aliases: ["degree program", "program", "major", "field of study"],
  },
  {
    key: "year_of_study",
    label: "Year of study",
    aliases: ["year of study", "year", "class year"],
  },
  {
    key: "current_semester",
    label: "Current semester",
    aliases: ["current semester", "semester", "current_semester_label"],
  },
  { key: "gpa", label: "GPA", type: "number", aliases: ["grade point average"] },
  {
    key: "status",
    label: "Status",
    type: "enum",
    enumValues: ["ACTIVE", "GRADUATED", "INACTIVE"],
    aliases: ["student status"],
  },
  {
    key: "bank_account_name",
    label: "Bank account name",
    aliases: ["account name", "bank name on account"],
  },
  {
    key: "bank_account_number",
    label: "Bank account number",
    aliases: ["account number", "bank account no"],
  },
  { key: "bank_name", label: "Bank name" },
  {
    key: "promptpay_number",
    label: "PromptPay number",
    aliases: ["promptpay", "prompt pay"],
  },
];

const UNIVERSITY_FIELDS: ImportFieldDef[] = [
  {
    key: "id",
    label: "ID",
    aliases: ["university id", "university_id"],
  },
  {
    key: "name",
    label: "Name",
    required: true,
    aliases: ["university", "university name", "institution"],
  },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  {
    key: "address_line",
    label: "Address",
    aliases: ["address line", "street address"],
  },
  {
    key: "website",
    label: "Website",
    aliases: ["website url", "website_url", "url"],
  },
  {
    key: "summer",
    label: "Summer semester",
    type: "boolean",
    aliases: ["has summer semester", "has_summer_semester"],
  },
  {
    key: "status",
    label: "Active status",
    type: "boolean",
    aliases: ["is active", "is_active", "active"],
  },
  { key: "notes", label: "Notes" },
];

export const UNIVERSITY_SEMESTER_FIELDS: ImportFieldDef[] = [
  {
    key: "university_id",
    label: "University ID",
    aliases: ["university id"],
  },
  {
    key: "university_name",
    label: "University",
    aliases: ["university name", "institution"],
  },
  {
    key: "id",
    label: "Semester ID",
    aliases: ["semester id", "semester_id"],
  },
  {
    key: "academic_year",
    label: "Academic year",
    required: true,
    aliases: ["academic year", "year"],
  },
  {
    key: "term_code",
    label: "Term",
    required: true,
    aliases: ["term code", "term_code", "term"],
  },
  {
    key: "label",
    label: "Label",
    required: true,
    aliases: ["semester label", "semester_label", "semester"],
  },
  {
    key: "start_date",
    label: "Start date",
    required: true,
    type: "date",
    aliases: ["start date", "start_date"],
  },
  {
    key: "end_date",
    label: "End date",
    required: true,
    type: "date",
    aliases: ["end date", "end_date"],
  },
  {
    key: "status",
    label: "Status",
    type: "boolean",
    aliases: ["is active", "is_active", "active"],
  },
];

export function getUniversitySemesterImportFields(): ImportFieldDef[] {
  return UNIVERSITY_SEMESTER_FIELDS;
}

const PAYMENT_FIELDS: ImportFieldDef[] = [
  {
    key: "request_id",
    label: "Payment request ID",
    aliases: ["request id", "tuition request id"],
  },
  {
    key: "student_id",
    label: "Student ID",
    aliases: ["student id", "matricule"],
  },
  {
    key: "student_email",
    label: "Student email",
    aliases: ["student email", "e-mail"],
  },
  {
    key: "semester",
    label: "Semester",
    aliases: ["semester label", "semester_label"],
  },
  {
    key: "amount_paid",
    label: "Amount paid",
    required: true,
    type: "number",
    aliases: ["amount", "payment amount", "amount due"],
  },
  {
    key: "payment_date",
    label: "Payment date",
    required: true,
    type: "date",
    aliases: ["date", "paid date", "paid_at", "submitted"],
  },
  {
    key: "payment_status",
    label: "Payment status",
    aliases: ["payment status"],
    type: "enum",
    enumValues: ["PAID"],
  },
  {
    key: "internal_notes",
    label: "Internal notes",
    aliases: ["notes", "admin notes"],
  },
];

export function getImportFields(entity: ImportEntity): ImportFieldDef[] {
  switch (entity) {
    case "students":
      return STUDENT_FIELDS;
    case "universities":
      return UNIVERSITY_FIELDS;
    case "payments":
      return PAYMENT_FIELDS;
  }
}

export function getImportEntityLabel(entity: ImportEntity): string {
  switch (entity) {
    case "students":
      return "Students";
    case "universities":
      return "Universities";
    case "payments":
      return "Payments";
  }
}
