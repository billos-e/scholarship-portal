export const ETHNICITY_OPTIONS = [
  "Rakhine",
  "Karen",
  "Burmese",
  "Thai",
  "Shan",
  "Kayan",
  "Kaya",
  "Lisu",
  "Lahu",
  "Arakine",
  "Rohinga",
  "Kachin",
  "Chin",
  "Mon",
  "Hmong",
  "Pao",
  "Danu",
  "Lawa",
  "Dawei",
] as const;

export type EthnicityOption = (typeof ETHNICITY_OPTIONS)[number];

export function normalizeEthnicity(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
  }
  if (typeof value === "string" && value.trim()) {
    if (value.includes(",") || value.includes(";")) {
      return [
        ...new Set(
          value
            .split(/[,;]/)
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ];
    }
    return [value.trim()];
  }
  return [];
}

export function formatEthnicity(value: unknown): string | null {
  const list = normalizeEthnicity(value);
  return list.length > 0 ? list.join(", ") : null;
}
