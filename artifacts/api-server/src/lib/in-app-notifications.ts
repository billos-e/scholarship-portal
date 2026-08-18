import { randomUUID } from "crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import {
  db,
  adminNotificationDismissals,
  adminNotificationLog,
  students,
  tuitionPaymentRequests,
  type AdminNotificationKind,
} from "@workspace/db";

export const UNREAD_NOTIFICATION_LIMIT = 50;

export const ADMIN_NOTIFICATION_TITLES: Record<AdminNotificationKind, string> = {
  GPA_UNDER_3: "GPA under 3.0",
  EMERGENCY_AID: "Emergency aid request",
  DEADLINE_APPROACHING: "Payment deadline approaching",
  DEADLINE_OVERDUE: "Payment deadline overdue",
};

export type UnreadAdminNotification = {
  id: string;
  kind: AdminNotificationKind;
  title: string;
  studentName: string;
  studentCode: string | null;
  semesterLabel: string;
  requestId: string;
  createdAt: string;
};

export async function listUnreadForAdmin(
  userId: string,
  limit = UNREAD_NOTIFICATION_LIMIT,
): Promise<UnreadAdminNotification[]> {
  const rows = await db
    .select({
      id: adminNotificationLog.id,
      kind: adminNotificationLog.kind,
      sentAt: adminNotificationLog.sentAt,
      requestId: tuitionPaymentRequests.id,
      semesterLabel: tuitionPaymentRequests.semesterLabel,
      firstName: students.firstName,
      lastName: students.lastName,
      studentCode: students.studentId,
    })
    .from(adminNotificationLog)
    .innerJoin(
      tuitionPaymentRequests,
      eq(adminNotificationLog.tuitionPaymentRequestId, tuitionPaymentRequests.id),
    )
    .innerJoin(students, eq(tuitionPaymentRequests.studentId, students.id))
    .leftJoin(
      adminNotificationDismissals,
      and(
        eq(adminNotificationDismissals.adminNotificationLogId, adminNotificationLog.id),
        eq(adminNotificationDismissals.userId, userId),
      ),
    )
    .where(isNull(adminNotificationDismissals.id))
    .orderBy(desc(adminNotificationLog.sentAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    title: ADMIN_NOTIFICATION_TITLES[row.kind],
    studentName: `${row.firstName} ${row.lastName}`.trim(),
    studentCode: row.studentCode,
    semesterLabel: row.semesterLabel,
    requestId: row.requestId,
    createdAt: row.sentAt.toISOString(),
  }));
}

export async function dismissForAdmin(
  userId: string,
  logId: string,
): Promise<"ok" | "not_found"> {
  const [log] = await db
    .select({ id: adminNotificationLog.id })
    .from(adminNotificationLog)
    .where(eq(adminNotificationLog.id, logId))
    .limit(1);

  if (!log) return "not_found";

  await db
    .insert(adminNotificationDismissals)
    .values({
      id: randomUUID(),
      userId,
      adminNotificationLogId: logId,
      dismissedAt: new Date(),
    })
    .onConflictDoNothing({
      target: [
        adminNotificationDismissals.userId,
        adminNotificationDismissals.adminNotificationLogId,
      ],
    });

  return "ok";
}
