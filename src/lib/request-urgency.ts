import type { RequestStatus } from "@prisma/client";

const STATUS_URGENCY: Record<RequestStatus, number> = {
  SUBMITTED: 0,
  APPROVED: 1,
  REJECTED: 2,
  PAID: 3,
};

type UrgentRequest = {
  status: RequestStatus;
  dueDate: Date | null;
  submittedAt: Date;
};

function dueUrgencyRank(dueDate: Date | null): number {
  if (!dueDate) return Number.MAX_SAFE_INTEGER;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due.getTime() - today.getTime();
}

export function sortRequestsByUrgency<T extends UrgentRequest>(requests: T[]): T[] {
  return [...requests].sort((a, b) => {
    const dueDiff = dueUrgencyRank(a.dueDate) - dueUrgencyRank(b.dueDate);
    if (dueDiff !== 0) return dueDiff;

    const statusDiff = STATUS_URGENCY[a.status] - STATUS_URGENCY[b.status];
    if (statusDiff !== 0) return statusDiff;

    return a.submittedAt.getTime() - b.submittedAt.getTime();
  });
}

export function isRequestOverdue(dueDate: Date | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}
