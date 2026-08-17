/** Calendar-day difference: due date minus today. Positive = future. */
export function daysUntilDue(dueDate: Date, now: Date = new Date()): number {
  const due = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due - today) / 86_400_000);
}

export type DeadlineKind = "DEADLINE_APPROACHING" | "DEADLINE_OVERDUE";

/**
 * Approaching: due today through `noticeDays` days from now (default 7).
 * Overdue: due date already passed. Mutually exclusive.
 */
export function deadlineKindFor(
  dueDate: Date,
  noticeDays: number,
  now: Date = new Date(),
): DeadlineKind | null {
  const days = daysUntilDue(dueDate, now);
  if (days < 0) return "DEADLINE_OVERDUE";
  if (days <= noticeDays) return "DEADLINE_APPROACHING";
  return null;
}

export function parseNoticeDays(raw: string | undefined, fallback = 7): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}
