-- Replace UNDER_REVIEW with REJECTED in the request workflow.

ALTER TABLE "tuition_payment_requests" ADD COLUMN "rejectedAt" TIMESTAMP(3);

UPDATE "tuition_payment_requests"
SET "status" = 'SUBMITTED'
WHERE "status" = 'UNDER_REVIEW';

CREATE TYPE "RequestStatus_new" AS ENUM ('SUBMITTED', 'APPROVED', 'PAID', 'REJECTED');

ALTER TABLE "tuition_payment_requests"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "RequestStatus_new"
  USING ("status"::text::"RequestStatus_new");

ALTER TABLE "tuition_payment_requests"
  ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

DROP TYPE "RequestStatus";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
