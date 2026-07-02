export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** e.g. "2" → "Year 2", preserves labels that already include "Year". */
export function formatYearOfStudy(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (/^year\s+/i.test(trimmed)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
  if (/^\d+$/.test(trimmed)) return `Year ${trimmed}`;
  return trimmed;
}

export type StudentHeroSummaryItem = {
  key: string;
  value: string;
  variant?: "id";
};

export function buildStudentHeroSummary(input: {
  studentIdNumber?: string | null;
  degreeProgram?: string | null;
  yearOfStudy?: string | null;
  currentSemesterLabel?: string | null;
  gpa?: string | number | null;
}): StudentHeroSummaryItem[] {
  const items: StudentHeroSummaryItem[] = [];

  if (input.studentIdNumber?.trim()) {
    items.push({
      key: "id",
      value: input.studentIdNumber.trim(),
      variant: "id",
    });
  }
  if (input.degreeProgram?.trim()) {
    items.push({ key: "degree", value: input.degreeProgram.trim() });
  }

  const year = formatYearOfStudy(input.yearOfStudy);
  if (year) items.push({ key: "year", value: year });

  if (input.currentSemesterLabel?.trim()) {
    items.push({ key: "semester", value: input.currentSemesterLabel.trim() });
  }

  if (input.gpa !== null && input.gpa !== undefined && String(input.gpa).trim()) {
    items.push({ key: "gpa", value: `GPA ${String(input.gpa).trim()}` });
  }

  return items;
}
