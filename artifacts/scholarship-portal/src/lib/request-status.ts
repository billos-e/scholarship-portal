import type { RequestStatus } from "@prisma/client";

/** Client workflow order: Submitted → Under Review → Approved → Paid */
export const CLIENT_REQUEST_STATUSES: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "PAID",
];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
};

export function requestStatusIndex(status: RequestStatus): number {
  if (status === "REJECTED") return -1;
  return CLIENT_REQUEST_STATUSES.indexOf(status);
}

/** Mirrors the transition rules enforced by the API (PUT /requests/:id/status). */
export const REQUEST_NEXT_STATUSES: Record<RequestStatus, RequestStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "SUBMITTED", "REJECTED"],
  APPROVED: ["PAID", "UNDER_REVIEW", "REJECTED"],
  REJECTED: ["SUBMITTED", "UNDER_REVIEW"],
  PAID: [],
};

export function canTransitionRequest(
  from: RequestStatus,
  to: RequestStatus,
): boolean {
  return REQUEST_NEXT_STATUSES[from]?.includes(to) ?? false;
}
