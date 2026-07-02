-- Restore Under Review in the payment request workflow (client spec).

CREATE TYPE "RequestStatus_new" AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'PAID',
  'REJECTED'
);

ALTER TABLE "tuition_payment_requests"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "tuition_payment_requests"
  ALTER COLUMN "status" TYPE "RequestStatus_new"
  USING ("status"::text::"RequestStatus_new");

ALTER TABLE "tuition_payment_requests"
  ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

DROP TYPE "RequestStatus";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
