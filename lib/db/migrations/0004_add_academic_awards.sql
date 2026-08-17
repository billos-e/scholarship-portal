-- Migration: add academic awards to semester_reports
-- Rationale: the Academic Report step needs two independent award flags
-- (excellence / other), optional supporting documents, and a comment
-- separate from academic_comment. All columns are nullable so existing
-- rows stay valid. award_file_urls is text[] so a student can attach
-- more than one certificate.

ALTER TABLE "semester_reports"
  ADD COLUMN "received_academic_excellence_award" boolean,
  ADD COLUMN "received_other_award" boolean,
  ADD COLUMN "award_file_urls" text[],
  ADD COLUMN "awards_comment" text;
