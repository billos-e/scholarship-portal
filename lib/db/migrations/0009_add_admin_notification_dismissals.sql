-- Migration: per-admin in-app notification dismissals
-- Rationale: admin_notification_log is unique on (request_id, kind) so emails
-- are not sent twice. That uniqueness is global — it cannot mean "this admin
-- has read the alert." Unread for admin A is a log row with no dismissal row
-- for A. Other admins still see it until they click. CASCADE on both FKs so
-- deleting a user or a payment request (which deletes the log) cleans up.

CREATE TABLE "admin_notification_dismissals" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL
    REFERENCES "users"("id") ON DELETE CASCADE,
  "admin_notification_log_id" text NOT NULL
    REFERENCES "admin_notification_log"("id") ON DELETE CASCADE,
  "dismissed_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "admin_notification_dismissals_user_log_uidx"
  ON "admin_notification_dismissals" ("user_id", "admin_notification_log_id");

CREATE INDEX "admin_notification_dismissals_user_id_idx"
  ON "admin_notification_dismissals" ("user_id");

CREATE INDEX "admin_notification_dismissals_log_id_idx"
  ON "admin_notification_dismissals" ("admin_notification_log_id");

CREATE INDEX "admin_notification_log_sent_at_idx"
  ON "admin_notification_log" ("sent_at" DESC);
