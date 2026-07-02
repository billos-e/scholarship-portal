import type { StudentStatus } from "@prisma/client";

export function parseBoolean(raw: string | undefined): boolean | undefined {
  if (!raw?.trim()) return undefined;
  const value = raw.trim().toLowerCase();
  if (["true", "yes", "y", "1", "active", "on"].includes(value)) return true;
  if (["false", "no", "n", "0", "inactive", "off"].includes(value)) return false;
  return undefined;
}

export function parseNumber(raw: string | undefined): number | undefined {
  if (!raw?.trim()) return undefined;
  const cleaned = raw.replace(/[,$\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

export function parseGpa(raw: string | undefined): number | undefined {
  const n = parseNumber(raw);
  if (n == null) return undefined;
  if (n < 0 || n > 4) return undefined;
  return n;
}

export function parseStudentStatus(raw: string | undefined): StudentStatus {
  const value = (raw ?? "").trim().toUpperCase();
  if (value === "GRADUATED" || value === "GRADUATE") return "GRADUATED";
  if (value === "INACTIVE") return "INACTIVE";
  return "ACTIVE";
}

export function parseDate(raw: string | undefined): Date | undefined {
  if (!raw?.trim()) return undefined;
  const value = raw.trim();

  const iso = new Date(value);
  if (!Number.isNaN(iso.getTime()) && value.includes("-")) {
    return new Date(
      Date.UTC(iso.getUTCFullYear(), iso.getUTCMonth(), iso.getUTCDate()),
    );
  }

  const excelSerial = Number(value);
  if (Number.isFinite(excelSerial) && excelSerial > 20000 && excelSerial < 80000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + excelSerial);
    return epoch;
  }

  const parts = value.split(/[/.-]/).map((p) => p.trim());
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if ([a, b, c].every((n) => Number.isFinite(n))) {
      const year = c < 100 ? 2000 + c : c;
      const month = b <= 12 ? b - 1 : a - 1;
      const day = b <= 12 ? a : b;
      const date = new Date(Date.UTC(year, month, day));
      if (!Number.isNaN(date.getTime())) return date;
    }
  }

  return undefined;
}
