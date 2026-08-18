import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import {
  db,
  users,
  adminNotificationLog,
  type AdminNotificationKind,
  type RequestCategory,
} from "@workspace/db";
import { logger } from "./logger";
import { isMailConfigured, sendEmail } from "./mail";

export const GPA_ALERT_THRESHOLD = 3.0;

const CATEGORY_LABELS: Record<RequestCategory, string> = {
  TUITION: "Tuition",
  LIVING_EXPENSES: "Living expenses",
  STUDY_ABROAD_INTERNSHIP: "Study abroad / internship",
  EMERGENCY_AID: "Emergency aid",
};

export type SubmissionNotifyInput = {
  requestId: string;
  studentName: string;
  studentCode: string | null;
  semesterLabel: string;
  requestCategory: RequestCategory;
  gpa: string | null;
};

export type DeadlineNotifyInput = SubmissionNotifyInput & {
  dueDate: Date;
  kind: Extract<AdminNotificationKind, "DEADLINE_APPROACHING" | "DEADLINE_OVERDUE">;
  daysUntilDue: number;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function parseGpa(raw: string | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function formatGpa(n: number): string {
  return n.toFixed(2);
}

function requestUrl(requestId: string): string | null {
  const base = process.env.PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (!base) return null;
  return `${base}/admin/requests/${requestId}`;
}

export async function listActiveAdminEmails(): Promise<string[]> {
  const rows = await db
    .select({ email: users.email })
    .from(users)
    .where(and(eq(users.role, "ADMIN"), eq(users.isActive, true)));

  return [
    ...new Set(
      rows
        .map((r) => r.email.trim().toLowerCase())
        .filter((email) => email.includes("@")),
    ),
  ];
}

function dl(rows: Array<[string, string]>): string {
  const items = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#555;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:4px 0;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  return `<table style="border-collapse:collapse;">${items}</table>`;
}

function wrapHtml(title: string, body: string, requestId: string): string {
  const url = requestUrl(requestId);
  const link = url
    ? `<p style="margin-top:20px;"><a href="${escapeHtml(url)}">Open payment request</a></p>`
    : `<p style="margin-top:20px;color:#555;">Payment request ID: ${escapeHtml(requestId)}</p>`;
  return `<!DOCTYPE html>
<html><body style="font-family:Georgia,serif;line-height:1.5;color:#111;">
  <p>${escapeHtml(title)}</p>
  ${body}
  ${link}
</body></html>`;
}

function wrapText(lines: string[], requestId: string): string {
  const url = requestUrl(requestId);
  const extra = url ? `Open payment request: ${url}` : `Payment request ID: ${requestId}`;
  return [...lines, "", extra].join("\n");
}

function commonRows(input: {
  studentName: string;
  studentCode: string | null;
  semesterLabel: string;
  requestCategory: RequestCategory;
  requestId: string;
}): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ["Student", input.studentName],
    ["Semester", input.semesterLabel],
    ["Category", CATEGORY_LABELS[input.requestCategory]],
    ["Request ID", input.requestId],
  ];
  if (input.studentCode) rows.splice(1, 0, ["Student ID", input.studentCode]);
  return rows;
}

/**
 * Insert the event log first so the in-app tray has a row even when email
 * is skipped or fails. Unique (request, kind) still prevents duplicate emails.
 * Do not delete the log after a failed send — unread in-app would vanish.
 */
async function claimAndSend(opts: {
  requestId: string;
  kind: AdminNotificationKind;
  subject: string;
  html: string;
  text: string;
}): Promise<"sent" | "skipped" | "failed"> {
  const claimed = await db
    .insert(adminNotificationLog)
    .values({
      id: randomUUID(),
      tuitionPaymentRequestId: opts.requestId,
      kind: opts.kind,
      sentAt: new Date(),
    })
    .onConflictDoNothing({
      target: [
        adminNotificationLog.tuitionPaymentRequestId,
        adminNotificationLog.kind,
      ],
    })
    .returning({ id: adminNotificationLog.id });

  if (!claimed[0]?.id) {
    logger.info(
      { kind: opts.kind, requestId: opts.requestId },
      "Admin notification already logged; skipping duplicate send",
    );
    return "skipped";
  }

  if (!isMailConfigured()) {
    logger.warn(
      { kind: opts.kind, requestId: opts.requestId },
      "Skipping admin notification email because RESEND_API_KEY is not set",
    );
    return "skipped";
  }

  const allRecipients = await listActiveAdminEmails();
  if (allRecipients.length === 0) {
    logger.warn(
      { kind: opts.kind, requestId: opts.requestId },
      "Skipping admin notification email: no active ADMIN users in the local users table",
    );
    return "skipped";
  }

  const recipients = allRecipients.slice(0, 50);
  if (allRecipients.length > 50) {
    logger.warn(
      { dropped: allRecipients.length - 50 },
      "Truncated admin recipient list to Resend's 50-address limit",
    );
  }

  const result = await sendEmail({
    to: recipients,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    idempotencyKey: `${opts.requestId}:${opts.kind}`.slice(0, 256),
  });

  if (result.ok) {
    logger.info(
      { kind: opts.kind, requestId: opts.requestId, emailId: result.id, recipients: recipients.length },
      "Admin notification sent",
    );
    return "sent";
  }

  if (result.skipped) {
    logger.warn(
      { kind: opts.kind, requestId: opts.requestId, reason: result.reason },
      "Admin notification email skipped after log insert; in-app row kept",
    );
    return "skipped";
  }

  logger.error(
    { kind: opts.kind, requestId: opts.requestId, reason: result.reason },
    "Admin notification send failed; in-app log row kept",
  );
  return "failed";
}

export async function notifyGpaUnderThreshold(
  input: SubmissionNotifyInput,
): Promise<"sent" | "skipped" | "failed"> {
  const gpa = parseGpa(input.gpa);
  if (gpa == null || gpa >= GPA_ALERT_THRESHOLD) return "skipped";

  const gpaLabel = formatGpa(gpa);
  const rows: Array<[string, string]> = [
    ...commonRows(input),
    ["GPA", gpaLabel],
  ];
  const intro = `A semester report was submitted with a GPA below ${GPA_ALERT_THRESHOLD.toFixed(1)}.`;
  return claimAndSend({
    requestId: input.requestId,
    kind: "GPA_UNDER_3",
    subject: `Low GPA alert: ${input.studentName} (${gpaLabel}) — ${input.semesterLabel}`,
    html: wrapHtml(intro, dl(rows), input.requestId),
    text: wrapText(
      [
        intro,
        "",
        `Student: ${input.studentName}`,
        input.studentCode ? `Student ID: ${input.studentCode}` : "",
        `Semester: ${input.semesterLabel}`,
        `Category: ${CATEGORY_LABELS[input.requestCategory]}`,
        `GPA: ${gpaLabel}`,
        `Request ID: ${input.requestId}`,
      ].filter(Boolean),
      input.requestId,
    ),
  });
}

export async function notifyEmergencyAid(
  input: SubmissionNotifyInput,
): Promise<"sent" | "skipped" | "failed"> {
  if (input.requestCategory !== "EMERGENCY_AID") return "skipped";

  const intro = "A student submitted an emergency aid payment request.";
  const gpa = parseGpa(input.gpa);
  const rows = commonRows(input);
  if (gpa != null) rows.push(["GPA", formatGpa(gpa)]);

  return claimAndSend({
    requestId: input.requestId,
    kind: "EMERGENCY_AID",
    subject: `Emergency aid request: ${input.studentName} — ${input.semesterLabel}`,
    html: wrapHtml(intro, dl(rows), input.requestId),
    text: wrapText(
      [
        intro,
        "",
        `Student: ${input.studentName}`,
        input.studentCode ? `Student ID: ${input.studentCode}` : "",
        `Semester: ${input.semesterLabel}`,
        `Category: ${CATEGORY_LABELS.EMERGENCY_AID}`,
        gpa != null ? `GPA: ${formatGpa(gpa)}` : "",
        `Request ID: ${input.requestId}`,
      ].filter(Boolean),
      input.requestId,
    ),
  });
}

export async function notifyDeadline(
  input: DeadlineNotifyInput,
): Promise<"sent" | "skipped" | "failed"> {
  const dueLabel = [
    input.dueDate.getFullYear(),
    String(input.dueDate.getMonth() + 1).padStart(2, "0"),
    String(input.dueDate.getDate()).padStart(2, "0"),
  ].join("-");
  const approaching = input.kind === "DEADLINE_APPROACHING";
  const dueIn =
    input.daysUntilDue === 0
      ? "due today"
      : `due in ${input.daysUntilDue} day${input.daysUntilDue === 1 ? "" : "s"}`;
  const intro = approaching
    ? `A payment request is ${dueIn} (${dueLabel}).`
    : `A payment request is overdue (due ${dueLabel}).`;
  const subject = approaching
    ? `Payment ${dueIn}: ${input.studentName} — ${input.semesterLabel}`
    : `Overdue payment request: ${input.studentName} — ${input.semesterLabel}`;

  const rows: Array<[string, string]> = [
    ...commonRows(input),
    ["Due date", dueLabel],
    ["Status", approaching ? "Approaching" : "Overdue"],
  ];

  return claimAndSend({
    requestId: input.requestId,
    kind: input.kind,
    subject,
    html: wrapHtml(intro, dl(rows), input.requestId),
    text: wrapText(
      [
        intro,
        "",
        `Student: ${input.studentName}`,
        input.studentCode ? `Student ID: ${input.studentCode}` : "",
        `Semester: ${input.semesterLabel}`,
        `Category: ${CATEGORY_LABELS[input.requestCategory]}`,
        `Due date: ${dueLabel}`,
        `Request ID: ${input.requestId}`,
      ].filter(Boolean),
      input.requestId,
    ),
  });
}

/**
 * Fire GPA + emergency-aid alerts after a successful submit.
 * Never throws — callers should still wrap if they want extra logging.
 */
export async function notifyAdminsAfterSubmission(
  input: SubmissionNotifyInput,
): Promise<void> {
  try {
    await Promise.all([notifyGpaUnderThreshold(input), notifyEmergencyAid(input)]);
  } catch (err) {
    logger.error(
      { err, requestId: input.requestId },
      "Admin notification after submission failed",
    );
  }
}
