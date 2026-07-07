export const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

/** Converts the given ISO-string keys of an object into Date objects (null-safe). */
export function reviveDates<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[],
): T {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string") {
      obj[key] = new Date(value) as T[keyof T];
    }
  }
  return obj;
}
