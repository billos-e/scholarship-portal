-- Migration: add remaining student profile fields (client items 7–10)
-- Rationale: scholarship type is the student's overall award, distinct from
-- payment-request category. Graduation year is the expected calendar year and
-- sits beside (does not replace) year_of_study. Religion is a constrained
-- single select. Ethnicity changes from a single text value to text[] so a
-- student can belong to more than one group. Existing ethnicity strings become
-- a one-element array. All new columns are nullable so current rows stay valid.

CREATE TYPE "scholarship_type" AS ENUM (
  'TUITION',
  'LIVING_EXPENSES',
  'FULL_SCHOLARSHIP'
);

CREATE TYPE "religion" AS ENUM (
  'CHRISTIAN',
  'BUDDHIST',
  'ANIMIST',
  'NONE'
);

ALTER TABLE "students"
  ADD COLUMN "scholarship_type" "scholarship_type",
  ADD COLUMN "graduation_year" integer,
  ADD COLUMN "religion" "religion";

ALTER TABLE "students"
  ALTER COLUMN "ethnicity" TYPE text[]
  USING CASE
    WHEN "ethnicity" IS NULL OR btrim("ethnicity") = '' THEN NULL
    ELSE ARRAY[btrim("ethnicity")]
  END;
