import {
  PrismaClient,
  RequestStatus,
  StudentStatus,
  TermCode,
  type UniversitySemester,
} from "@prisma/client";
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

async function seedRequest(
  studentId: string,
  semester: UniversitySemester,
  status: RequestStatus,
  amountDue: number,
  submittedAt: Date,
) {
  const existing = await prisma.tuitionPaymentRequest.findFirst({
    where: {
      studentId,
      universitySemesterId: semester.id,
    },
  });
  if (existing) return existing;

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
      dueDate: new Date(semester.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
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
        reflectionChallenge: "Managing time between classes and part-time work.",
        reflectionAdditional: "Thank you for the continued scholarship support.",
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

  const semesterDefs: Array<{
    universityId: string;
    academicYear: string;
    termCode: TermCode;
    label: string;
    startDate: string;
    endDate: string;
  }> = [
    { universityId: chula.id, academicYear: "2024", termCode: "FALL", label: "Fall 2024", startDate: "2024-08-15", endDate: "2024-12-15" },
    { universityId: chula.id, academicYear: "2025", termCode: "SPRING", label: "Spring 2025", startDate: "2025-01-10", endDate: "2025-05-20" },
    { universityId: chula.id, academicYear: "2025", termCode: "FALL", label: "Fall 2025", startDate: "2025-08-15", endDate: "2025-12-15" },
    { universityId: chula.id, academicYear: "2026", termCode: "SPRING", label: "Spring 2026", startDate: "2026-01-10", endDate: "2026-05-20" },
    { universityId: chula.id, academicYear: "2026", termCode: "SUMMER", label: "Summer 2026", startDate: "2026-06-01", endDate: "2026-07-31" },
    { universityId: chula.id, academicYear: "2026", termCode: "FALL", label: "Fall 2026", startDate: "2026-08-15", endDate: "2026-12-15" },
    { universityId: chula.id, academicYear: "2027", termCode: "SPRING", label: "Spring 2027", startDate: "2027-01-10", endDate: "2027-05-20" },
    { universityId: mahidol.id, academicYear: "2024", termCode: "FALL", label: "Fall 2024", startDate: "2024-08-20", endDate: "2024-12-10" },
    { universityId: mahidol.id, academicYear: "2025", termCode: "SPRING", label: "Spring 2025", startDate: "2025-01-15", endDate: "2025-05-15" },
    { universityId: mahidol.id, academicYear: "2025", termCode: "FALL", label: "Fall 2025", startDate: "2025-08-20", endDate: "2025-12-10" },
    { universityId: mahidol.id, academicYear: "2026", termCode: "SPRING", label: "Spring 2026", startDate: "2026-01-15", endDate: "2026-05-15" },
    { universityId: mahidol.id, academicYear: "2026", termCode: "FALL", label: "Fall 2026", startDate: "2026-08-20", endDate: "2026-12-10" },
  ];

  const semesters: UniversitySemester[] = [];
  for (const def of semesterDefs) {
    semesters.push(
      await upsertSemester(def.universityId, {
        academicYear: def.academicYear,
        termCode: def.termCode,
        label: def.label,
        startDate: new Date(def.startDate),
        endDate: new Date(def.endDate),
      }),
    );
  }

  const fall2026 = semesters.find(
    (s) => s.label === "Fall 2026" && s.universityId === chula.id,
  )!;

  const universities = [chula, mahidol];
  const semesterLabel = fall2026.label;

  const studentSeeds = [
    { first: "Anong", last: "Saetang", program: "Computer Science", year: "2", gpa: 3.72 },
    { first: "Kasem", last: "Phromma", program: "Civil Engineering", year: "3", gpa: 3.15 },
    { first: "Mali", last: "Chaiwong", program: "Nursing", year: "1", gpa: 3.9 },
    { first: "Niran", last: "Boonmee", program: "Business Administration", year: "4", gpa: 2.95 },
    { first: "Pimchanok", last: "Srisuk", program: "Public Health", year: "2", gpa: 3.55 },
    { first: "Somchai", last: "Wattana", program: "Mechanical Engineering", year: "3", gpa: 3.0 },
    { first: "Siriporn", last: "Kaewta", program: "Law", year: "2", gpa: 3.45 },
    { first: "Thanawat", last: "Rattanakul", program: "Architecture", year: "3", gpa: 3.28 },
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

    createdStudents.push({ student, universityId: university.id, name: `${s.first} ${s.last}` });
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

  const statusCycle: RequestStatus[] = [
    RequestStatus.PAID,
    RequestStatus.PAID,
    RequestStatus.APPROVED,
    RequestStatus.UNDER_REVIEW,
    RequestStatus.REJECTED,
    RequestStatus.SUBMITTED,
  ];

  let submissionCount = 0;
  const submissionLabels = ["Fall 2025", "Spring 2026", "Fall 2026"];

  for (const { student, universityId, name } of createdStudents) {
    const uniSemesters = semesters.filter(
      (s) =>
        s.universityId === universityId &&
        submissionLabels.includes(s.label),
    );

    for (let j = 0; j < uniSemesters.length; j++) {
      const semester = uniSemesters[j];
      const status = statusCycle[(submissionCount + j) % statusCycle.length];
      const amount = 22000 + (j % 4) * 2500 + (submissionCount % 3) * 1000;
      const submittedAt = new Date(semester.startDate);
      submittedAt.setDate(submittedAt.getDate() + 14);

      process.stdout.write(`  → ${name} / ${semester.label}\n`);
      await seedRequest(student.id, semester, status, amount, submittedAt);
    }

    submissionCount += 1;
  }

  console.log("Seed complete.");
  console.log(`  Semesters: ${semesters.length}`);
  console.log(`  Students:  ${createdStudents.length} active (+2 inactive/graduated)`);
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
