export type TableExportColumn = {
  key: string;
  label: string;
  table: string;
  column: string;
};

export const STUDENTS_TABLE_COLUMNS: TableExportColumn[] = [
  {
    key: "name",
    label: "Name",
    table: "students",
    column: "first_name, last_name",
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
    key: "degree_program",
    label: "Program",
    table: "students",
    column: "degree_program",
  },
  {
    key: "status",
    label: "Status",
    table: "students",
    column: "status",
  },
];

export const REQUESTS_TABLE_COLUMNS: TableExportColumn[] = [
  {
    key: "student",
    label: "Student",
    table: "students",
    column: "first_name, last_name",
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
];

export const UNIVERSITIES_TABLE_COLUMNS: TableExportColumn[] = [
  {
    key: "name",
    label: "Name",
    table: "universities",
    column: "name",
  },
  {
    key: "location",
    label: "Location",
    table: "universities",
    column: "city, country",
  },
  {
    key: "students",
    label: "Students",
    table: "students",
    column: "university_id",
  },
  {
    key: "semesters",
    label: "Semesters",
    table: "university_semesters",
    column: "university_id",
  },
  {
    key: "summer",
    label: "Summer",
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
