import { and, eq, inArray, isNotNull } from "drizzle-orm";
import {
  db,
  students,
  tuitionPaymentRequests,
  type RequestCategory,
} from "@workspace/db";
import { notifyDeadline } from "./admin-notifications";
import { deadlineKindFor, daysUntilDue, parseNoticeDays } from "./deadline-window";
import { logger } from "./logger";

const OPEN_REQUEST_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] as const;

export type DeadlineJobResult = {
  checked: number;
  sent: number;
  skipped: number;
  failed: number;
  noticeDays: number;
};

export async function runDeadlineNotifications(
  now: Date = new Date(),
): Promise<DeadlineJobResult> {
  const noticeDays = parseNoticeDays(process.env.DEADLINE_NOTICE_DAYS);
  const rows = await db
    .select({
      id: tuitionPaymentRequests.id,
      dueDate: tuitionPaymentRequests.dueDate,
      semesterLabel: tuitionPaymentRequests.semesterLabel,
      requestCategory: tuitionPaymentRequests.requestCategory,
      firstName: students.firstName,
      lastName: students.lastName,
      studentCode: students.studentId,
    })
    .from(tuitionPaymentRequests)
    .innerJoin(students, eq(tuitionPaymentRequests.studentId, students.id))
    .where(
      and(
        isNotNull(tuitionPaymentRequests.dueDate),
        inArray(tuitionPaymentRequests.status, [...OPEN_REQUEST_STATUSES]),
      ),
    );

  const result: DeadlineJobResult = {
    checked: rows.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    noticeDays,
  };

  for (const row of rows) {
    if (!row.dueDate) {
      result.skipped += 1;
      continue;
    }
    const days = daysUntilDue(row.dueDate, now);
    const kind = deadlineKindFor(row.dueDate, noticeDays, now);
    if (!kind) {
      result.skipped += 1;
      continue;
    }

    const status = await notifyDeadline({
      requestId: row.id,
      studentName: `${row.firstName} ${row.lastName}`.trim(),
      studentCode: row.studentCode,
      semesterLabel: row.semesterLabel,
      requestCategory: row.requestCategory as RequestCategory,
      gpa: null,
      dueDate: row.dueDate,
      kind,
      daysUntilDue: days,
    });

    if (status === "sent") result.sent += 1;
    else if (status === "failed") result.failed += 1;
    else result.skipped += 1;
  }

  logger.info(result, "Deadline notification job finished");
  return result;
}
