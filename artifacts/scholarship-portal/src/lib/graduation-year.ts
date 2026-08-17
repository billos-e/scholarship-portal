export function graduationYearBounds(now = new Date()) {
  const year = now.getFullYear();
  return { min: year - 2, max: year + 10 };
}

/** Newest first. Includes `current` when it falls outside the default range. */
export function graduationYearOptions(
  current?: number | null,
  now = new Date(),
): number[] {
  const { min, max } = graduationYearBounds(now);
  const years: number[] = [];
  for (let year = max; year >= min; year -= 1) years.push(year);
  if (
    current != null &&
    Number.isInteger(current) &&
    !years.includes(current)
  ) {
    years.push(current);
    years.sort((a, b) => b - a);
  }
  return years;
}
