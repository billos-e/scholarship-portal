-- Migration: add the three current reflection questions on semester_reports
-- Rationale: client items 11–14 replace the prompt text students see, but
-- historical answers live in reflection_achievement / reflection_challenge /
-- reflection_additional. Those columns stay. New submissions write only to
-- the new nullable columns. Detail views fall back to the old columns when
-- the new ones are empty.

ALTER TABLE "semester_reports"
  ADD COLUMN "reflection_overcome_challenge" text,
  ADD COLUMN "reflection_meaningful_experience" text,
  ADD COLUMN "reflection_proud_achievement" text;
