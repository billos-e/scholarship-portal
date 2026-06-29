import { PrismaClient, RequestStatus, StudentStatus, TermCode } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "password123";

function hash(plain: string) {
  return bcrypt.hash(plain, 10);
}

async function upsertSemester(
  universityId: string,
  data: {
    academicYear: string;
    termCode: TermCode;
    label: string;
    startDate: Date;
    endDate: Date;
  },
) {
  const existing = await prisma.universitySemester.findFirst({
    where: { universityId, label: data.label },
  });
  if (existing) return existing;
  return prisma.universitySemester.create({
    data: { universityId, ...data, isActive: true },
  });
}

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hash(DEFAULT_PASSWORD);
  const studentPassword = await hash(DEFAULT_PASSWORD);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const chula = await prisma.university.upsert({
    where: { name: "Chulalongkorn University" },
    update: {
      city: "Bangkok",
      country: "Thailand",
      addressLine: "254 Phayathai Road, Pathumwan",
      websiteUrl: "https://www.chula.ac.th",
      hasSummerSemester: true,
      isActive: true,
    },
    create: {
      name: "Chulalongkorn University",
      city: "Bangkok",
      country: "Thailand",
      addressLine: "254 Phayathai Road, Pathumwan",
      websiteUrl: "https://www.chula.ac.th",
      hasSummerSemester: true,
    },
  });

  const mahidol = await prisma.university.upsert({
    where: { name: "Mahidol University" },
    update: {
      city: "Nakhon Pathom",
      country: "Thailand",
      addressLine: "999 Phutthamonthon Sai 4 Road",
      websiteUrl: "https://www.mahidol.ac.th",
      hasSummerSemester: false,
      isActive: true,
    },
    create: {
      name: "Mahidol University",
      city: "Nakhon Pathom",
      country: "Thailand",
      addressLine: "999 Phutthamonthon Sai 4 Road",
      websiteUrl: "https://www.mahidol.ac.th",
      hasSummerSemester: false,
    },
  });

  const fall2026 = await upsertSemester(chula.id, {
    academicYear: "2026",
    termCode: "FALL",
    label: "Fall 2026",
    startDate: new Date("2026-08-15"),
    endDate: new Date("2026-12-15"),
  });

  await upsertSemester(chula.id, {
    academicYear: "2027",
    termCode: "SPRING",
    label: "Spring 2027",
    startDate: new Date("2027-01-10"),
    endDate: new Date("2027-05-20"),
  });

  await upsertSemester(chula.id, {
    academicYear: "2026",
    termCode: "SUMMER",
    label: "Summer 2026",
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-07-31"),
  });

  await upsertSemester(mahidol.id, {
    academicYear: "2026",
    termCode: "FALL",
    label: "Fall 2026",
    startDate: new Date("2026-08-20"),
    endDate: new Date("2026-12-10"),
  });

  const universities = [chula, mahidol];
  const semesterLabel = fall2026.label;

  const studentSeeds = [
    { first: "Anong", last: "Saetang", program: "Computer Science", year: "2", gpa: 3.72 },
    { first: "Kasem", last: "Phromma", program: "Civil Engineering", year: "3", gpa: 3.15 },
    { first: "Mali", last: "Chaiwong", program: "Nursing", year: "1", gpa: 3.9 },
    { first: "Niran", last: "Boonmee", program: "Business Administration", year: "4", gpa: 2.95 },
    { first: "Pimchanok", last: "Srisuk", program: "Public Health", year: "2", gpa: 3.55 },
    { first: "Somchai", last: "Wattana", program: "Mechanical Engineering", year: "3", gpa: 3.0 },
  ];

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
      update: {
        studentId: `STU-2024-${String(847 + i).padStart(4, "0")}`,
        currentSemesterLabel: semesterLabel,
      },
      create: {
        userId: user.id,
        studentId: `STU-2024-${String(847 + i).padStart(4, "0")}`,
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
      studentId: "STU-2024-0999",
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

  const inactiveUser = await prisma.user.upsert({
    where: { email: "inactive@example.com" },
    update: {},
    create: {
      email: "inactive@example.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      isActive: false,
    },
  });
  await prisma.student.upsert({
    where: { userId: inactiveUser.id },
    update: {},
    create: {
      userId: inactiveUser.id,
      studentId: "STU-2024-0888",
      firstName: "Wanida",
      lastName: "Thongchai",
      universityId: mahidol.id,
      degreeProgram: "Medicine",
      yearOfStudy: "2",
      currentSemesterLabel: semesterLabel,
      gpa: 3.4,
      status: StudentStatus.INACTIVE,
    },
  });

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
        universitySemesterId: fall2026.id,
        amountDue: 25000,
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

    if (i < 2) {
      await prisma.semesterReport.create({
        data: {
          studentId: student.id,
          tuitionPaymentRequestId: request.id,
          semesterLabel,
          universitySemesterId: fall2026.id,
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
