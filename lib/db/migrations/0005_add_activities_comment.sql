-- Migration: add activities_comment to semester_reports
-- Rationale: Activities moved from the Wellbeing step to Reflections.
-- Students need an optional free-text field to qualify the activities
-- they selected. The existing activities text[] column is unchanged.
-- Nullable so existing rows stay valid.

ALTER TABLE "semester_reports"
  ADD COLUMN "activities_comment" text;
