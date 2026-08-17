export const REQUEST_CATEGORIES = [
  "TUITION",
  "LIVING_EXPENSES",
  "STUDY_ABROAD_INTERNSHIP",
  "EMERGENCY_AID",
] as const;

export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export const REQUEST_CATEGORY_LABELS: Record<RequestCategory, string> = {
  TUITION: "Tuition",
  LIVING_EXPENSES: "Living expenses",
  STUDY_ABROAD_INTERNSHIP: "Study abroad / internship",
  EMERGENCY_AID: "Emergency aid",
};

export const REQUEST_CATEGORY_DESCRIPTIONS: Record<RequestCategory, string> = {
  TUITION: "Invoice and tuition fees for this semester",
  LIVING_EXPENSES: "Housing, food, and day-to-day support",
  STUDY_ABROAD_INTERNSHIP: "Placement, exchange, or internship costs",
  EMERGENCY_AID: "Urgent, unexpected financial need",
};

export function isRequestCategory(value: unknown): value is RequestCategory {
  return (
    typeof value === "string" &&
    (REQUEST_CATEGORIES as readonly string[]).includes(value)
  );
}

export function parseRequestCategory(value: unknown): RequestCategory | null {
  return isRequestCategory(value) ? value : null;
}

export function requestCategoryLabel(value: string | null | undefined): string {
  if (isRequestCategory(value)) return REQUEST_CATEGORY_LABELS[value];
  return REQUEST_CATEGORY_LABELS.TUITION;
}
