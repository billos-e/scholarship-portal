export const RELIGIONS = [
  "CHRISTIAN",
  "BUDDHIST",
  "ANIMIST",
  "NONE",
] as const;

export type Religion = (typeof RELIGIONS)[number];

export const RELIGION_LABELS: Record<Religion, string> = {
  CHRISTIAN: "Christian",
  BUDDHIST: "Buddhist",
  ANIMIST: "Animist",
  NONE: "None",
};

export function isReligion(value: unknown): value is Religion {
  return (
    typeof value === "string" && (RELIGIONS as readonly string[]).includes(value)
  );
}

export function parseReligion(value: unknown): Religion | null {
  return isReligion(value) ? value : null;
}

export function religionLabel(value: string | null | undefined): string | null {
  if (isReligion(value)) return RELIGION_LABELS[value];
  return null;
}
