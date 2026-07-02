export type TableExportColumn = {
  key: string;
  label: string;
  table: string;
  column: string;
};

export const STUDENTS_TABLE_COLUMNS: TableExportColumn[] = [
  {
    key: "id",
    label: "ID",
    table: "students",
    column: "id",
  },
  {
    key: "first_name",
    label: "First name",
    table: "students",
    column: "first_name",
  },
  {
    key: "last_name",
    label: "Last name",
    table: "students",
    column: "last_name",
  },
  {
    key: "email",
    label: "Email",
    table: "users",
    column: "email",
  },
  {
    key: "phone",
    label: "Phone",
    table: "students",
    column: "phone",
  },
  {
    key: "student_id",
    label: "Student ID",
    table: "students",
    column: "student_id",
  },
  {
    key: "member_since",
    label: "Member since",
    table: "students",
    column: "created_at",
  },
  {
    key: "university",
    label: "University",
    table: "universities",
    column: "name",
  },
  {
    key: "degree_program",
    label: "Degree program",
    table: "students",
    column: "degree_program",
  },
  {
    key: "year_of_study",
    label: "Year of study",
    table: "students",
    column: "year_of_study",
  },
  {
    key: "current_semester",
    label: "Current semester",
    table: "students",
    column: "current_semester_label",
  },
  {
    key: "gpa",
    label: "GPA",
    table: "students",
    column: "gpa",
  },
  {
    key: "status",
    label: "Status",
    table: "students",
    column: "status",
  },
  {
    key: "bank_account_name",
    label: "Bank account name",
    table: "bank_information",
    column: "bank_account_name",
  },
  {
    key: "bank_account_number",
    label: "Bank account number",
    table: "bank_information",
    column: "bank_account_number",
  },
  {
    key: "bank_name",
    label: "Bank name",
    table: "bank_information",
    column: "bank_name",
  },
  {
    key: "promptpay_number",
    label: "PromptPay number",
    table: "bank_information",
    column: "promptpay_number",
  },
];

export const REQUESTS_TABLE_COLUMNS: TableExportColumn[] = [
  {
    key: "id",
    label: "Request ID",
    table: "tuition_payment_requests",
    column: "id",
  },
  {
    key: "student_first_name",
    label: "Student first name",
    table: "students",
    column: "first_name",
  },
  {
    key: "student_last_name",
    label: "Student last name",
    table: "students",
    column: "last_name",
  },
  {
    key: "student_id",
    label: "Student ID",
    table: "students",
    column: "student_id",
  },
  {
    key: "university",
    label: "University",
    table: "universities",
    column: "name",
  },
  {
    key: "semester",
    label: "Semester",
    table: "tuition_payment_requests",
    column: "semester_label",
  },
  {
    key: "amount_due",
    label: "Amount due",
    table: "tuition_payment_requests",
    column: "amount_due",
  },
  {
    key: "due_date",
    label: "Due date",
    table: "tuition_payment_requests",
    column: "due_date",
  },
  {
    key: "submitted",
    label: "Submitted",
    table: "tuition_payment_requests",
    column: "submitted_at",
  },
  {
    key: "status",
    label: "Status",
    table: "tuition_payment_requests",
    column: "status",
  },
  {
    key: "admin_notes",
    label: "Admin notes",
    table: "tuition_payment_requests",
    column: "admin_notes",
  },
  {
    key: "internal_notes",
    label: "Internal notes",
    table: "payment_history",
    column: "internal_notes",
  },
];

export const UNIVERSITIES_TABLE_COLUMNS: TableExportColumn[] = [
  {
    key: "id",
    label: "ID",
    table: "universities",
    column: "id",
  },
  {
    key: "name",
    label: "Name",
    table: "universities",
    column: "name",
  },
  {
    key: "city",
    label: "City",
    table: "universities",
    column: "city",
  },
  {
    key: "country",
    label: "Country",
    table: "universities",
    column: "country",
  },
  {
    key: "address_line",
    label: "Address",
    table: "universities",
    column: "address_line",
  },
  {
    key: "website",
    label: "Website",
    table: "universities",
    column: "website_url",
  },
  {
    key: "notes",
    label: "Notes",
    table: "universities",
    column: "notes",
  },
  {
    key: "students",
    label: "Students",
    table: "students",
    column: "university_id",
  },
  {
    key: "summer",
    label: "Summer semester",
    table: "universities",
    column: "has_summer_semester",
  },
  {
    key: "status",
    label: "Status",
    table: "universities",
    column: "is_active",
  },
];

export const UNIVERSITY_SEMESTERS_TABLE_COLUMNS: TableExportColumn[] = [
  {
    key: "university_id",
    label: "University ID",
    table: "university_semesters",
    column: "university_id",
  },
  {
    key: "university_name",
    label: "University",
    table: "universities",
    column: "name",
  },
  {
    key: "id",
    label: "Semester ID",
    table: "university_semesters",
    column: "id",
  },
  {
    key: "academic_year",
    label: "Academic year",
    table: "university_semesters",
    column: "academic_year",
  },
  {
    key: "term_code",
    label: "Term",
    table: "university_semesters",
    column: "term_code",
  },
  {
    key: "label",
    label: "Label",
    table: "university_semesters",
    column: "label",
  },
  {
    key: "start_date",
    label: "Start date",
    table: "university_semesters",
    column: "start_date",
  },
  {
    key: "end_date",
    label: "End date",
    table: "university_semesters",
    column: "end_date",
  },
  {
    key: "status",
    label: "Status",
    table: "university_semesters",
    column: "is_active",
  },
];

export function defaultTableColumnKeys(columns: TableExportColumn[]): string[] {
  return columns.map((column) => column.key);
}

export function groupTableColumnsByTable(
  columns: TableExportColumn[],
): { table: string; columns: TableExportColumn[] }[] {
  const groups = new Map<string, TableExportColumn[]>();

  for (const column of columns) {
    const existing = groups.get(column.table);
    if (existing) {
      existing.push(column);
    } else {
      groups.set(column.table, [column]);
    }
  }

  return Array.from(groups.entries()).map(([table, tableColumns]) => ({
    table,
    columns: tableColumns,
  }));
}
