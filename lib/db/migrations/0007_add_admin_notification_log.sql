-- Migration: admin_notification_log + due_date index
-- Rationale: email all active DB admins on GPA < 3.0, emergency aid, and
-- payment-request deadlines. The log stores (request_id, kind) so the
-- deadline cron can run often without sending the same alert twice.
-- GPA / emergency rows are logged the same way for audit and safety.
-- due_date is indexed because the cron scans open requests by date.

CREATE TYPE "admin_notification_kind" AS ENUM (
  'GPA_UNDER_3',
  'EMERGENCY_AID',
  'DEADLINE_APPROACHING',
  'DEADLINE_OVERDUE'
);

CREATE TABLE "admin_notification_log" (
  "id" text PRIMARY KEY NOT NULL,
  "tuition_payment_request_id" text NOT NULL
    REFERENCES "tuition_payment_requests"("id") ON DELETE CASCADE,
  "kind" "admin_notification_kind" NOT NULL,
  "sent_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "admin_notification_log_request_kind_idx"
  ON "admin_notification_log" ("tuition_payment_request_id", "kind");

CREATE INDEX "admin_notification_log_kind_idx"
  ON "admin_notification_log" ("kind");

CREATE INDEX "tpr_due_date_idx"
  ON "tuition_payment_requests" ("due_date");
