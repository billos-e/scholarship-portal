export type SortDirection = "asc" | "desc";

export type SortState<K extends string> = {
  key: K | null;
  direction: SortDirection;
};

export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  return String(a).localeCompare(String(b), undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

export function sortItems<T, K extends string>(
  items: T[],
  sort: SortState<K>,
  accessors: Record<K, (item: T) => unknown>,
): T[] {
  if (!sort.key) return items;

  const accessor = accessors[sort.key];
  const multiplier = sort.direction === "asc" ? 1 : -1;

  return [...items].sort(
    (a, b) => compareValues(accessor(a), accessor(b)) * multiplier,
  );
}

export function toggleSort<K extends string>(
  current: SortState<K>,
  key: K,
): SortState<K> {
  if (current.key !== key) {
    return { key, direction: "asc" };
  }
  if (current.direction === "asc") {
    return { key, direction: "desc" };
  }
  return { key: null, direction: "asc" };
}
