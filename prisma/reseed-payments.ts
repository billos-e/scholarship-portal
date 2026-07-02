/**
 * One-off cleanup: remove all payment requests and reseed clean demo data
 * that satisfies submission eligibility rules.
 */
import {
  PrismaClient,
  RequestStatus,
  StudentStatus,
  type UniversitySemester,
} from "@prisma/client";

import { getMissingProfileFields } from "../src/lib/submissions/eligibility";

const prisma = new PrismaClient();

const SUBMISSION_LABELS = ["Fall 2025", "Spring 2026", "Fall 2026"] as const;

const FALL_2026_STATUSES: RequestStatus[] = [
  RequestStatus.PAID,
  RequestStatus.PAID,
  RequestStatus.APPROVED,
  RequestStatus.UNDER_REVIEW,
  RequestStatus.SUBMITTED,
  RequestStatus.REJECTED,
  RequestStatus.PAID,
  RequestStatus.APPROVED,
];

async function seedRequest(
  studentId: string,
  semester: UniversitySemester,
  status: RequestStatus,
  amountDue: number,
  submittedAt: Date,
) {
  const bank = await prisma.bankInformation.findUnique({
    where: { studentId },
  });

  const reviewedAt =
    status === "UNDER_REVIEW" ||
    status === "APPROVED" ||
    status === "PAID"
      ? new Date(submittedAt.getTime() + 2 * 24 * 60 * 60 * 1000)
      : null;
  const approvedAt =
    status === "APPROVED" || status === "PAID"
      ? new Date(submittedAt.getTime() + 5 * 24 * 60 * 60 * 1000)
      : null;
  const paidAt =
    status === "PAID"
      ? new Date(submittedAt.getTime() + 10 * 24 * 60 * 60 * 1000)
      : null;
  const rejectedAt =
    status === "REJECTED"
      ? new Date(submittedAt.getTime() + 4 * 24 * 60 * 60 * 1000)
      : null;

  const request = await prisma.tuitionPaymentRequest.create({
    data: {
      studentId,
      semesterLabel: semester.label,
      universitySemesterId: semester.id,
      amountDue,
      dueDate: new Date(
        semester.startDate.getTime() + 30 * 24 * 60 * 60 * 1000,
      ),
      status,
      submittedAt,
      reviewedAt,
      approvedAt,
      paidAt,
      rejectedAt,
      bankAccountName: bank?.bankAccountName,
      bankAccountNumber: bank?.bankAccountNumber,
      bankName: bank?.bankName,
      promptpayNumber: bank?.promptpayNumber,
    },
  });

  if (status !== "SUBMITTED") {
    const student = await prisma.student.findUniqueOrThrow({
      where: { id: studentId },
    });

    await prisma.semesterReport.create({
      data: {
        studentId,
        tuitionPaymentRequestId: request.id,
        semesterLabel: semester.label,
        universitySemesterId: semester.id,
        gpa: Number(student.gpa ?? 3.2),
        creditsCompleted: 15 + (submittedAt.getMonth() % 6),
        passedAllCourses: true,
        wellbeingPhysical: 3 + (submittedAt.getMonth() % 3),
        wellbeingMental: 3,
        wellbeingFinancial: 2,
        wellbeingStress: 3,
        wellbeingConfidence: 4,
        challenges: ["financial"],
        activities: ["volunteering"],
        reflectionAchievement: `Completed ${semester.label} coursework successfully.`,
        reflectionChallenge:
          "Managing time between classes and part-time work.",
        reflectionAdditional:
          "Thank you for the continued scholarship support.",
      },
    });
  }

  if (status === "PAID") {
    await prisma.paymentHistory.create({
      data: {
        studentId,
        tuitionPaymentRequestId: request.id,
        semesterLabel: semester.label,
        amountPaid: amountDue,
        paymentStatus: "PAID",
        paymentDate: paidAt ?? submittedAt,
        internalNotes: `Paid for ${semester.label}.`,
      },
    });
  }

  return request;
}

async function main() {
  console.log("Cleaning payment data...");

  const deleted = await prisma.tuitionPaymentRequest.deleteMany();
  console.log(`  Deleted ${deleted.count} tuition payment requests (reports + history cascaded).`);

  const students = await prisma.student.findMany({
    where: { status: StudentStatus.ACTIVE },
    include: { bankInformation: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const eligible = students.filter(
    (s) => getMissingProfileFields(s).length === 0 && s.universityId,
  );

  console.log(`Reseeding for ${eligible.length} eligible active students...`);

  let studentIndex = 0;
  for (const student of eligible) {
    const semesters = await prisma.universitySemester.findMany({
      where: {
        universityId: student.universityId!,
        label: { in: [...SUBMISSION_LABELS] },
      },
      orderBy: { startDate: "asc" },
    });

    if (semesters.length === 0) {
      console.warn(
        `  Skipping ${student.firstName} ${student.lastName}: no matching semesters.`,
      );
      continue;
    }

    const fall2026Status =
      FALL_2026_STATUSES[studentIndex % FALL_2026_STATUSES.length];

    for (let j = 0; j < semesters.length; j++) {
      const semester = semesters[j];
      const isFall2026 = semester.label === "Fall 2026";
      const status = isFall2026 ? fall2026Status : RequestStatus.PAID;
      const amount = 22000 + (j % 4) * 2500 + (studentIndex % 3) * 1000;
      const submittedAt = new Date(semester.startDate);
      submittedAt.setDate(submittedAt.getDate() + 14);

      console.log(
        `  → ${student.firstName} ${student.lastName} / ${semester.label} (${status})`,
      );
      await seedRequest(student.id, semester, status, amount, submittedAt);
    }

    studentIndex += 1;
  }

  const total = await prisma.tuitionPaymentRequest.count();
  const nullSem = await prisma.tuitionPaymentRequest.count({
    where: { universitySemesterId: null },
  });
  const multiActive = await prisma.$queryRaw<{ cnt: bigint }[]>`
    SELECT COUNT(*)::bigint AS cnt FROM (
      SELECT t."studentId"
      FROM tuition_payment_requests t
      WHERE t.status IN ('SUBMITTED','UNDER_REVIEW','APPROVED')
      GROUP BY t."studentId"
      HAVING COUNT(*) > 1
    ) x
  `;

  console.log("\nReseed complete.");
  console.log(`  Total requests: ${total}`);
  console.log(`  Missing universitySemesterId: ${nullSem}`);
  console.log(
    `  Students with multiple active requests: ${Number(multiActive[0]?.cnt ?? 0)}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
