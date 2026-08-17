-- Migration: add request_category to tuition_payment_requests
-- Rationale: one payment-request table covers four budget categories.
-- Existing rows are tuition submissions, so they backfill as TUITION.
-- Uniqueness is (student, semester, category) excluding REJECTED so a
-- student can submit emergency aid in the same semester as tuition, but
-- cannot submit two active tuition requests for the same term.

CREATE TYPE "request_category" AS ENUM (
  'TUITION',
  'LIVING_EXPENSES',
  'STUDY_ABROAD_INTERNSHIP',
  'EMERGENCY_AID'
);

ALTER TABLE "tuition_payment_requests"
  ADD COLUMN "request_category" "request_category" NOT NULL DEFAULT 'TUITION';

CREATE INDEX "tpr_request_category_idx"
  ON "tuition_payment_requests" ("request_category");

CREATE INDEX "tpr_student_category_status_idx"
  ON "tuition_payment_requests" ("student_id", "request_category", "status");

CREATE UNIQUE INDEX "tpr_student_semester_category_active_idx"
  ON "tuition_payment_requests" ("student_id", "semester_label", "request_category")
  WHERE "status" <> 'REJECTED';
