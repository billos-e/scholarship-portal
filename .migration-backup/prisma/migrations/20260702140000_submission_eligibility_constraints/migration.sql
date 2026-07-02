-- Deduplicate active submissions per student + semester (keep most recent).
-- Needed because seed/dev data may contain overlapping rows before this constraint.
DELETE FROM "tuition_payment_requests"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "studentId", "universitySemesterId"
        ORDER BY "submittedAt" DESC, "createdAt" DESC
      ) AS rn
    FROM "tuition_payment_requests"
    WHERE "universitySemesterId" IS NOT NULL
      AND "status" NOT IN ('REJECTED')
  ) ranked
  WHERE rn > 1
);

-- Prevent duplicate active submissions for the same student + university semester.
-- REJECTED rows are excluded so a student may resubmit after rejection.
CREATE UNIQUE INDEX "tuition_payment_requests_student_semester_active_key"
ON "tuition_payment_requests" ("studentId", "universitySemesterId")
WHERE "universitySemesterId" IS NOT NULL
  AND "status" NOT IN ('REJECTED');
