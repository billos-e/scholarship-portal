-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'GRADUATED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID');

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hasSummerSemester" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "universityId" TEXT,
    "degreeProgram" TEXT,
    "yearOfStudy" TEXT,
    "currentSemesterLabel" TEXT,
    "gpa" DECIMAL(3,2),
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_information" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankName" TEXT,
    "promptpayNumber" TEXT,
    "qrPaymentImageUrl" TEXT,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tuition_payment_requests" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "semesterLabel" TEXT NOT NULL,
    "amountDue" DECIMAL(10,2) NOT NULL,
    "dueDate" DATE,
    "invoiceFileUrl" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "adminNotes" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankName" TEXT,
    "promptpayNumber" TEXT,
    "qrPaymentImageUrl" TEXT,
    "universitySemesterId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tuition_payment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester_reports" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tuitionPaymentRequestId" TEXT NOT NULL,
    "semesterLabel" TEXT NOT NULL,
    "gpa" DECIMAL(3,2),
    "creditsCompleted" INTEGER,
    "passedAllCourses" BOOLEAN,
    "transcriptFileUrl" TEXT,
    "wellbeingPhysical" INTEGER,
    "wellbeingMental" INTEGER,
    "wellbeingFinancial" INTEGER,
    "wellbeingStress" INTEGER,
    "wellbeingConfidence" INTEGER,
    "challenges" TEXT[],
    "activities" TEXT[],
    "reflectionAchievement" TEXT,
    "reflectionChallenge" TEXT,
    "reflectionAdditional" TEXT,
    "universitySemesterId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semester_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_history" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tuitionPaymentRequestId" TEXT NOT NULL,
    "semesterLabel" TEXT NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PAID',
    "paymentDate" DATE NOT NULL,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentId_key" ON "students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_information_studentId_key" ON "bank_information"("studentId");

-- CreateIndex
CREATE INDEX "tuition_payment_requests_studentId_idx" ON "tuition_payment_requests"("studentId");

-- CreateIndex
CREATE INDEX "tuition_payment_requests_status_idx" ON "tuition_payment_requests"("status");

-- CreateIndex
CREATE INDEX "tuition_payment_requests_semesterLabel_idx" ON "tuition_payment_requests"("semesterLabel");

-- CreateIndex
CREATE UNIQUE INDEX "semester_reports_tuitionPaymentRequestId_key" ON "semester_reports"("tuitionPaymentRequestId");

-- CreateIndex
CREATE INDEX "semester_reports_studentId_idx" ON "semester_reports"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_history_tuitionPaymentRequestId_key" ON "payment_history"("tuitionPaymentRequestId");

-- CreateIndex
CREATE INDEX "payment_history_studentId_idx" ON "payment_history"("studentId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_information" ADD CONSTRAINT "bank_information_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuition_payment_requests" ADD CONSTRAINT "tuition_payment_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_reports" ADD CONSTRAINT "semester_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_reports" ADD CONSTRAINT "semester_reports_tuitionPaymentRequestId_fkey" FOREIGN KEY ("tuitionPaymentRequestId") REFERENCES "tuition_payment_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_tuitionPaymentRequestId_fkey" FOREIGN KEY ("tuitionPaymentRequestId") REFERENCES "tuition_payment_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
