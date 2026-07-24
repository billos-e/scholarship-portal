// Shared option lists for semester submissions. Used by the student form,
// the server action validator, and the read-only detail page.

export const SEMESTER_LABEL_SUGGESTIONS = [
  "Fall 2026",
  "Spring 2027",
  "Summer 2027",
  "Winter 2027",
  "Fall 2025",
  "Spring 2026",
  "Summer 2026",
] as const;

export const CHALLENGE_OPTIONS = [
  { value: "financial", label: "Financial difficulties" },
  { value: "family", label: "Family responsibilities" },
  { value: "mental_health", label: "Mental health" },
  { value: "housing", label: "Housing" },
  { value: "transportation", label: "Transportation" },
  { value: "technology", label: "Technology / equipment" },
  { value: "health", label: "Physical health" },
  { value: "other", label: "Other" },
] as const;

export const ACTIVITY_OPTIONS = [
  { value: "community_service", label: "Community service" },
  { value: "volunteering", label: "Volunteering" },
  { value: "leadership", label: "Leadership role" },
  { value: "internship", label: "Internship" },
  { value: "part_time_work", label: "Part-time work" },
  { value: "student_clubs", label: "Student clubs" },
] as const;

export type ChallengeValue = (typeof CHALLENGE_OPTIONS)[number]["value"];
export type ActivityValue = (typeof ACTIVITY_OPTIONS)[number]["value"];

export const CHALLENGE_VALUES = CHALLENGE_OPTIONS.map((o) => o.value) as readonly ChallengeValue[];
export const ACTIVITY_VALUES = ACTIVITY_OPTIONS.map((o) => o.value) as readonly ActivityValue[];

export function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export const WELLBEING_QUESTIONS = [
  { name: "wellbeingPhysical", label: "Physical wellbeing" },
  { name: "wellbeingMental", label: "Mental wellbeing" },
  { name: "wellbeingFinancial", label: "Financial wellbeing" },
  { name: "wellbeingStress", label: "Overall Stress Level" },
  { name: "wellbeingConfidence", label: "Confidence in studies" },
] as const;
