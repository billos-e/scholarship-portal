-- Migration: allow up to 2 bank accounts per student (client item 16)
-- Rationale: bank_information was 1:1 via UNIQUE(student_id). Keep the same
-- table and existing columns so current rows and payment-request snapshots
-- stay intact. Drop that unique constraint, add sort_order (1 = primary,
-- 2 = second), and cap at two accounts with UNIQUE(student_id, sort_order)
-- plus CHECK (sort_order IN (1, 2)). Existing rows become account 1.

ALTER TABLE "bank_information"
  ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'bank_information'::regclass
      AND conname = 'bank_information_student_id_unique'
  ) THEN
    ALTER TABLE "bank_information" DROP CONSTRAINT "bank_information_student_id_unique";
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'bank_information'::regclass
      AND conname = 'bank_information_student_id_key'
  ) THEN
    ALTER TABLE "bank_information" DROP CONSTRAINT "bank_information_student_id_key";
  END IF;
END $$;

DROP INDEX IF EXISTS "bank_information_student_id_unique";
DROP INDEX IF EXISTS "bank_information_student_id_key";

UPDATE "bank_information"
SET "sort_order" = 1
WHERE "sort_order" IS DISTINCT FROM 1;

ALTER TABLE "bank_information"
  DROP CONSTRAINT IF EXISTS "bank_information_sort_order_chk";

ALTER TABLE "bank_information"
  ADD CONSTRAINT "bank_information_sort_order_chk"
  CHECK ("sort_order" IN (1, 2));

CREATE UNIQUE INDEX IF NOT EXISTS "bank_information_student_id_sort_order_uidx"
  ON "bank_information" ("student_id", "sort_order");

CREATE INDEX IF NOT EXISTS "bank_information_student_id_idx"
  ON "bank_information" ("student_id");
