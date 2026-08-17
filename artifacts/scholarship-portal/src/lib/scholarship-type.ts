export const SCHOLARSHIP_TYPES = [
  "TUITION",
  "LIVING_EXPENSES",
  "FULL_SCHOLARSHIP",
] as const;

export type ScholarshipType = (typeof SCHOLARSHIP_TYPES)[number];

export const SCHOLARSHIP_TYPE_LABELS: Record<ScholarshipType, string> = {
  TUITION: "Tuition",
  LIVING_EXPENSES: "Living expenses",
  FULL_SCHOLARSHIP: "Full scholarship",
};

export function isScholarshipType(value: unknown): value is ScholarshipType {
  return (
    typeof value === "string" &&
    (SCHOLARSHIP_TYPES as readonly string[]).includes(value)
  );
}

export function parseScholarshipType(value: unknown): ScholarshipType | null {
  return isScholarshipType(value) ? value : null;
}

export function scholarshipTypeLabel(value: string | null | undefined): string | null {
  if (isScholarshipType(value)) return SCHOLARSHIP_TYPE_LABELS[value];
  return null;
}
