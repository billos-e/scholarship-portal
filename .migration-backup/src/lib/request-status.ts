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
