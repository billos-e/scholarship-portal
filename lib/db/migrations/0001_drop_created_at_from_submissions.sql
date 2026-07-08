-- Migration: drop created_at from tuition_payment_requests and semester_reports
-- Rationale: submitted_at is the authoritative insertion timestamp for these two
-- tables. created_at was redundant and seeded with future dates, causing
-- incorrect sort order. This migration:
--   1. Backfills any rows where submitted_at was in the future (bad seed data)
--      by overwriting with created_at (the true insertion time).
--   2. Drops the now-redundant created_at column from both tables.

-- Backfill corrupted rows before dropping the source column
UPDATE tuition_payment_requests
SET submitted_at = created_at
WHERE submitted_at > NOW();

UPDATE semester_reports
SET submitted_at = created_at
WHERE submitted_at > NOW();

-- Drop the redundant column
ALTER TABLE tuition_payment_requests DROP COLUMN IF EXISTS created_at;
ALTER TABLE semester_reports DROP COLUMN IF EXISTS created_at;
