import { PrismaClient, RequestStatus, StudentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "password123";

function hash(plain: string) {
  return bcrypt.hash(plain, 10);
}

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hash(DEFAULT_PASSWORD);
  const studentPassword = await hash(DEFAULT_PASSWORD);

  // --- Admin -------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  // --- Universities ------------------------------------------------------
  const chula = await prisma.university.upsert({
    where: { name: "Chulalongkorn University" },
    update: {},
    create: { name: "Chulalongkorn University", hasSummerSemester: true },
  });

  const mahidol = await prisma.university.upsert({
    where: { name: "Mahidol University" },
    update: {},
    create: { name: "Mahidol University", hasSummerSemester: false },
  });

  const universities = [chula, mahidol];

  // --- Students ----------------------------------------------------------
  const studentSeeds = [
    { first: "Anong", last: "Saetang", program: "Computer Science", year: "2", gpa: 3.72 },
    { first: "Kasem", last: "Phromma", program: "Civil Engineering", year: "3", gpa: 3.15 },
    { first: "Mali", last: "Chaiwong", program: "Nursing", year: "1", gpa: 3.9 },
    { first: "Niran", last: "Boonmee", program: "Business Administration", year: "4", gpa: 2.95 },
    { first: "Pim", last: "Srisuk", program: "Public Health", year: "2", gpa: 3.55 },
    { first: "Somchai", last: "Wattana", program: "Mechanical Engineering", year: "3", gpa: 3.0 },
  ];

  const semesterLabel = "Fall 2026";
  const createdStudents = [];

  for (let i = 0; i < studentSeeds.length; i++) {
    const s = studentSeeds[i];
    const email = `${s.first.toLowerCase()}.${s.last.toLowerCase()}@example.com`;
    const university = universities[i % universities.length];

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: studentPassword,
        role: "STUDENT",
      },
    });

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        studentId: `STU-${1000 + i}`,
        firstName: s.first,
        lastName: s.last,
        phone: `08${String(10000000 + i * 13579).slice(0, 8)}`,
        universityId: university.id,
        degreeProgram: s.program,
        yearOfStudy: s.year,
        currentSemesterLabel: semesterLabel,
        gpa: s.gpa,
        status: StudentStatus.ACTIVE,
        bankInformation: {
          create: {
            bankAccountName: `${s.first} ${s.last}`,
            bankAccountNumber: `123-4-${String(56789 + i).padStart(5, "0")}`,
            bankName: "Bangkok Bank",
            promptpayNumber: `08${String(10000000 + i * 13579).slice(0, 8)}`,
          },
        },
      },
    });

    createdStudents.push(student);
  }

  // --- A graduated student (access disabled, history preserved) ----------
  const gradUser = await prisma.user.upsert({
    where: { email: "graduated@example.com" },
    update: {},
    create: {
      email: "graduated@example.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      isActive: false,
    },
  });
  await prisma.student.upsert({
    where: { userId: gradUser.id },
    update: {},
    create: {
      userId: gradUser.id,
      studentId: "STU-0999",
      firstName: "Ploy",
      lastName: "Intara",
      universityId: chula.id,
      degreeProgram: "Economics",
      yearOfStudy: "4",
      currentSemesterLabel: "Spring 2026",
      gpa: 3.8,
      status: StudentStatus.GRADUATED,
    },
  });

  // --- Payment requests at different statuses ---------------------------
  const statuses: RequestStatus[] = [
    RequestStatus.SUBMITTED,
    RequestStatus.UNDER_REVIEW,
    RequestStatus.APPROVED,
  ];

  for (let i = 0; i < statuses.length; i++) {
    const student = createdStudents[i];
    const bank = await prisma.bankInformation.findUnique({
      where: { studentId: student.id },
    });

    const existing = await prisma.tuitionPaymentRequest.findFirst({
      where: { studentId: student.id, semesterLabel },
    });
    if (existing) continue;

    const request = await prisma.tuitionPaymentRequest.create({
      data: {
        studentId: student.id,
        semesterLabel,
        amountDue: 25000 + i * 5000,
        dueDate: new Date("2026-09-15"),
        status: statuses[i],
        reviewedAt: i >= 1 ? new Date() : null,
        approvedAt: i >= 2 ? new Date() : null,
        bankAccountName: bank?.bankAccountName,
        bankAccountNumber: bank?.bankAccountNumber,
        bankName: bank?.bankName,
        promptpayNumber: bank?.promptpayNumber,
      },
    });

    // Linked semester report for the first two requests.
    if (i < 2) {
      await prisma.semesterReport.create({
        data: {
          studentId: student.id,
          tuitionPaymentRequestId: request.id,
          semesterLabel,
          gpa: Number(student.gpa ?? 3.0),
          creditsCompleted: 18,
          passedAllCourses: true,
          wellbeingPhysical: 4,
          wellbeingMental: 3,
          wellbeingFinancial: 2,
          wellbeingStress: 3,
          wellbeingConfidence: 4,
          challenges: ["financial", "transportation"],
          activities: ["volunteering", "part_time_work"],
          reflectionAchievement: "Maintained a strong GPA while working part-time.",
          reflectionChallenge: "Balancing study and work; built a weekly schedule.",
          reflectionAdditional: "Grateful for the scholarship support this semester.",
        },
      });
    }
  }

  // --- One fully paid request with payment history ----------------------
  const paidStudent = createdStudents[3];
  const paidExisting = await prisma.tuitionPaymentRequest.findFirst({
    where: { studentId: paidStudent.id, semesterLabel: "Spring 2026" },
  });
  if (!paidExisting) {
    const paidRequest = await prisma.tuitionPaymentRequest.create({
      data: {
        studentId: paidStudent.id,
        semesterLabel: "Spring 2026",
        amountDue: 30000,
        dueDate: new Date("2026-02-15"),
        status: RequestStatus.PAID,
        reviewedAt: new Date("2026-01-20"),
        approvedAt: new Date("2026-01-25"),
        paidAt: new Date("2026-02-01"),
      },
    });
    await prisma.paymentHistory.create({
      data: {
        studentId: paidStudent.id,
        tuitionPaymentRequestId: paidRequest.id,
        semesterLabel: "Spring 2026",
        amountPaid: 30000,
        paymentStatus: "PAID",
        paymentDate: new Date("2026-02-01"),
        internalNotes: "Transfer completed via Bangkok Bank.",
      },
    });
  }

  console.log("Seed complete.");
  console.log("  Admin:   admin@example.com / password123");
  console.log("  Student: anong.saetang@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
