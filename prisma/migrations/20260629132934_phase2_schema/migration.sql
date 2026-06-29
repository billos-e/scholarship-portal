-- CreateEnum
CREATE TYPE "TermCode" AS ENUM ('FALL', 'SPRING', 'SUMMER', 'WINTER');

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "universities" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT;

-- CreateTable
CREATE TABLE "university_semesters" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "termCode" "TermCode" NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_semesters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "university_semesters_universityId_idx" ON "university_semesters"("universityId");

-- CreateIndex
CREATE INDEX "university_semesters_startDate_idx" ON "university_semesters"("startDate");

-- AddForeignKey
ALTER TABLE "university_semesters" ADD CONSTRAINT "university_semesters_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuition_payment_requests" ADD CONSTRAINT "tuition_payment_requests_universitySemesterId_fkey" FOREIGN KEY ("universitySemesterId") REFERENCES "university_semesters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_reports" ADD CONSTRAINT "semester_reports_universitySemesterId_fkey" FOREIGN KEY ("universitySemesterId") REFERENCES "university_semesters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
