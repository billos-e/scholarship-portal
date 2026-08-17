import pg from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

const q = (text: string, values?: unknown[]) => client.query(text, values);

const DEFAULT_PASSWORD = "password123";

async function hashPw(plain: string) {
  return bcrypt.hash(plain, 10);
}

function id() {
  return randomUUID();
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function upsertUniversity(name: string, data: Record<string, unknown>) {
  const existing = await q(`SELECT id FROM universities WHERE name = $1`, [name]);
  if (existing.rows.length) return existing.rows[0].id as string;
  const newId = id();
  await q(
    `INSERT INTO universities (id, name, city, country, address_line, website_url, has_summer_semester, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [newId, name, data.city, data.country, data.addressLine, data.websiteUrl, data.hasSummerSemester, true],
  );
  return newId;
}

async function upsertDegreeProgram(universityId: string, name: string) {
  const existing = await q(
    `SELECT id FROM degree_programs WHERE university_id=$1 AND lower(name)=lower($2)`,
    [universityId, name],
  );
  if (existing.rows.length) return existing.rows[0].id as string;
  const newId = id();
  await q(
    `INSERT INTO degree_programs (id, university_id, name, is_active) VALUES ($1,$2,$3,$4)`,
    [newId, universityId, name, true],
  );
  return newId;
}

async function upsertSemester(universityId: string, data: {
  academicYear: string; termCode: string; label: string; startDate: Date; endDate: Date;
}) {
  const existing = await q(
    `SELECT id FROM university_semesters WHERE university_id=$1 AND label=$2`,
    [universityId, data.label],
  );
  if (existing.rows.length) return { id: existing.rows[0].id as string, ...data };
  const newId = id();
  await q(
    `INSERT INTO university_semesters (id, university_id, academic_year, term_code, label, start_date, end_date, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [newId, universityId, data.academicYear, data.termCode, data.label, data.startDate, data.endDate, true],
  );
  return { id: newId, ...data };
}

async function upsertUser(email: string, passwordHash: string, role: "ADMIN" | "STUDENT", isActive = true) {
  const existing = await q(`SELECT id FROM users WHERE email=$1`, [email]);
  if (existing.rows.length) return existing.rows[0].id as string;
  const newId = id();
  await q(
    `INSERT INTO users (id, email, password_hash, role, is_active) VALUES ($1,$2,$3,$4,$5)`,
    [newId, email, passwordHash, role, isActive],
  );
  return newId;
}

async function upsertStudent(userId: string, data: Record<string, unknown>) {
  const existing = await q(`SELECT id FROM students WHERE user_id=$1`, [userId]);
  if (existing.rows.length) return existing.rows[0].id as string;
  const newId = id();
  await q(
    `INSERT INTO students (id, user_id, student_id, first_name, last_name, phone, university_id,
      degree_program, year_of_study, current_semester_label, gpa, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [newId, userId, data.studentId, data.firstName, data.lastName, data.phone,
     data.universityId, data.degreeProgram, data.yearOfStudy, data.currentSemesterLabel,
     data.gpa, data.status ?? "ACTIVE"],
  );
  return newId;
}

async function upsertBankInfo(studentId: string, data: Record<string, unknown>) {
  const existing = await q(`SELECT id FROM bank_information WHERE student_id=$1`, [studentId]);
  if (existing.rows.length) return;
  await q(
    `INSERT INTO bank_information (id, student_id, bank_account_name, bank_account_number, bank_name, promptpay_number)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id(), studentId, data.bankAccountName, data.bankAccountNumber, data.bankName, data.promptpayNumber],
  );
}

async function seedRequest(studentId: string, bankStudentId: string, semester: { id: string; label: string; startDate: Date }, status: string, amountDue: number, submittedAt: Date) {
  const existing = await q(
    `SELECT id FROM tuition_payment_requests WHERE student_id=$1 AND university_semester_id=$2 AND request_category='TUITION'`,
    [studentId, semester.id],
  );
  if (existing.rows.length) return existing.rows[0].id as string;

  const bankRow = await q(`SELECT * FROM bank_information WHERE student_id=$1`, [bankStudentId]);
  const bank = bankRow.rows[0];

  const reviewedAt = ["UNDER_REVIEW", "APPROVED", "PAID"].includes(status) ? addDays(submittedAt, 2) : null;
  const approvedAt = ["APPROVED", "PAID"].includes(status) ? addDays(submittedAt, 5) : null;
  const paidAt = status === "PAID" ? addDays(submittedAt, 10) : null;
  const rejectedAt = status === "REJECTED" ? addDays(submittedAt, 4) : null;
  const dueDate = addDays(semester.startDate, 30);

  const reqId = id();
  await q(
    `INSERT INTO tuition_payment_requests
      (id, student_id, semester_label, amount_due, due_date, status,
       bank_account_name, bank_account_number, bank_name, promptpay_number,
       university_semester_id, submitted_at, reviewed_at, approved_at, paid_at, rejected_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [reqId, studentId, semester.label, amountDue, dueDate, status,
     bank?.bank_account_name, bank?.bank_account_number, bank?.bank_name, bank?.promptpay_number,
     semester.id, submittedAt, reviewedAt, approvedAt, paidAt, rejectedAt],
  );

  if (status !== "SUBMITTED") {
    const studentRow = await q(`SELECT gpa FROM students WHERE id=$1`, [studentId]);
    const gpa = studentRow.rows[0]?.gpa ?? 3.2;
    await q(
      `INSERT INTO semester_reports
        (id, student_id, tuition_payment_request_id, semester_label, gpa, credits_completed,
         passed_all_courses, wellbeing_physical, wellbeing_mental, wellbeing_financial,
         wellbeing_stress, wellbeing_confidence, challenges, activities,
         reflection_achievement, reflection_challenge, reflection_additional, university_semester_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [id(), studentId, reqId, semester.label, gpa, 15 + (submittedAt.getMonth() % 6), true,
       3 + (submittedAt.getMonth() % 3), 3, 2, 3, 4,
       '{"financial"}', '{"volunteering"}',
       `Completed ${semester.label} coursework successfully.`,
       "Managing time between classes and part-time work.",
       "Thank you for the continued scholarship support.",
       semester.id],
    );
  }

  if (status === "PAID") {
    await q(
      `INSERT INTO payment_history
        (id, student_id, tuition_payment_request_id, semester_label, amount_paid, payment_status, payment_date, internal_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id(), studentId, reqId, semester.label, amountDue, "PAID", paidAt, `Paid for ${semester.label}.`],
    );
  }

  return reqId;
}

async function main() {
  console.log("Seeding database...");

  const adminHash = await hashPw(DEFAULT_PASSWORD);
  const studentHash = await hashPw(DEFAULT_PASSWORD);

  // --- Admin user ---
  await upsertUser("admin@example.com", adminHash, "ADMIN");
  console.log("  ✓ admin@example.com / password123");

  // --- Universities ---
  const chulaId = await upsertUniversity("Chulalongkorn University", {
    city: "Bangkok", country: "Thailand",
    addressLine: "254 Phayathai Road, Pathumwan",
    websiteUrl: "https://www.chula.ac.th",
    hasSummerSemester: true,
  });
  const mahidolId = await upsertUniversity("Mahidol University", {
    city: "Nakhon Pathom", country: "Thailand",
    addressLine: "999 Phutthamonthon Sai 4 Road",
    websiteUrl: "https://www.mahidol.ac.th",
    hasSummerSemester: false,
  });
  const chiangMaiId = await upsertUniversity("Chiang Mai University", {
    city: "Chiang Mai", country: "Thailand",
    addressLine: "239 Huay Kaew Road",
    websiteUrl: "https://www.cmu.ac.th",
    hasSummerSemester: true,
  });
  console.log("  ✓ 3 universities");

  // --- Degree programs ---
  const programNames = [
    "Computer Science", "Civil Engineering", "Nursing",
    "Business Administration", "Public Health", "Mechanical Engineering",
    "Law", "Architecture", "Economics", "Medicine",
  ];
  for (const name of programNames) {
    await upsertDegreeProgram(chulaId, name);
    await upsertDegreeProgram(mahidolId, name);
    await upsertDegreeProgram(chiangMaiId, name);
  }
  console.log("  ✓ degree programs");

  // --- Semesters ---
  const semDefs = [
    { uId: chulaId, ay: "2024", tc: "FALL",   label: "Fall 2024",   start: "2024-08-15", end: "2024-12-15" },
    { uId: chulaId, ay: "2025", tc: "SPRING", label: "Spring 2025", start: "2025-01-10", end: "2025-05-20" },
    { uId: chulaId, ay: "2025", tc: "FALL",   label: "Fall 2025",   start: "2025-08-15", end: "2025-12-15" },
    { uId: chulaId, ay: "2026", tc: "SPRING", label: "Spring 2026", start: "2026-01-10", end: "2026-05-20" },
    { uId: chulaId, ay: "2026", tc: "SUMMER", label: "Summer 2026", start: "2026-06-01", end: "2026-07-31" },
    { uId: chulaId, ay: "2026", tc: "FALL",   label: "Fall 2026",   start: "2026-08-15", end: "2026-12-15" },
    { uId: mahidolId, ay: "2024", tc: "FALL",   label: "Fall 2024",   start: "2024-08-20", end: "2024-12-10" },
    { uId: mahidolId, ay: "2025", tc: "SPRING", label: "Spring 2025", start: "2025-01-15", end: "2025-05-15" },
    { uId: mahidolId, ay: "2025", tc: "FALL",   label: "Fall 2025",   start: "2025-08-20", end: "2025-12-10" },
    { uId: mahidolId, ay: "2026", tc: "SPRING", label: "Spring 2026", start: "2026-01-15", end: "2026-05-15" },
    { uId: mahidolId, ay: "2026", tc: "FALL",   label: "Fall 2026",   start: "2026-08-20", end: "2026-12-10" },
    { uId: chiangMaiId, ay: "2025", tc: "FALL",   label: "Fall 2025",   start: "2025-08-15", end: "2025-12-15" },
    { uId: chiangMaiId, ay: "2026", tc: "SPRING", label: "Spring 2026", start: "2026-01-10", end: "2026-05-20" },
    { uId: chiangMaiId, ay: "2026", tc: "FALL",   label: "Fall 2026",   start: "2026-08-15", end: "2026-12-15" },
  ];

  const semesters: Record<string, { id: string; label: string; uId: string; startDate: Date }> = {};
  for (const def of semDefs) {
    const sem = await upsertSemester(def.uId, {
      academicYear: def.ay, termCode: def.tc, label: def.label,
      startDate: new Date(def.start), endDate: new Date(def.end),
    });
    semesters[`${def.uId}:${def.label}`] = { id: sem.id, label: def.label, uId: def.uId, startDate: new Date(def.start) };
  }
  console.log("  ✓ semesters");

  // --- Students ---
  const studentSeeds = [
    { first: "Somchai", last: "Jaidee",  program: "Computer Science",       year: "3", gpa: 3.6,  uId: chulaId,    email: "somchai.jaidee@example.com" },
    { first: "Anan",    last: "Wong",     program: "Civil Engineering",       year: "2", gpa: 3.15, uId: chiangMaiId, email: "anan.wong@example.com" },
    { first: "Malee",   last: "Srisuk",   program: "Nursing",                year: "1", gpa: 3.9,  uId: chulaId,    email: "malee.srisuk@example.com" },
    { first: "Nong",    last: "Phet",     program: "Business Administration", year: "4", gpa: 2.95, uId: chiangMaiId, email: "nong.phet@example.com" },
    { first: "Pim",     last: "Chaiwong", program: "Public Health",           year: "2", gpa: 3.55, uId: mahidolId,  email: "pim.chaiwong@example.com" },
    { first: "Krit",    last: "Boonmee",  program: "Mechanical Engineering",  year: "3", gpa: 3.0,  uId: mahidolId,  email: "krit.boonmee@example.com" },
    { first: "Siri",    last: "Kaewta",   program: "Law",                     year: "2", gpa: 3.45, uId: chulaId,    email: "siri.kaewta@example.com" },
    { first: "Thanawat",last: "Rattana",  program: "Architecture",            year: "3", gpa: 3.28, uId: mahidolId,  email: "thanawat.rattana@example.com" },
  ];

  const fall2026Statuses = ["PAID","PAID","APPROVED","UNDER_REVIEW","SUBMITTED","REJECTED","PAID","APPROVED"];
  const submissionLabels = ["Fall 2025", "Spring 2026", "Fall 2026"];

  const createdStudents: { studentId: string; uId: string; name: string }[] = [];

  for (let i = 0; i < studentSeeds.length; i++) {
    const s = studentSeeds[i];
    const userId = await upsertUser(s.email, studentHash, "STUDENT");
    const studentId = await upsertStudent(userId, {
      studentId: `STU-2024-${String(847 + i).padStart(4, "0")}`,
      firstName: s.first, lastName: s.last,
      phone: `08${String(10000000 + i * 13579).slice(0, 8)}`,
      universityId: s.uId,
      degreeProgram: s.program,
      yearOfStudy: s.year,
      currentSemesterLabel: "Fall 2026",
      gpa: s.gpa,
      status: "ACTIVE",
    });
    await upsertBankInfo(studentId, {
      bankAccountName: `${s.first} ${s.last}`,
      bankAccountNumber: `123-4-${String(56789 + i).padStart(5, "0")}`,
      bankName: "Bangkok Bank",
      promptpayNumber: `08${String(10000000 + i * 13579).slice(0, 8)}`,
    });

    const uniSemesters = Object.values(semesters).filter(
      (sem) => sem.uId === s.uId && submissionLabels.includes(sem.label),
    );
    const fall2026Status = fall2026Statuses[i % fall2026Statuses.length];

    const now = new Date();
    for (let j = 0; j < uniSemesters.length; j++) {
      const sem = uniSemesters[j];
      const status = sem.label === "Fall 2026" ? fall2026Status : "PAID";
      const amount = 22000 + (j % 4) * 2500 + (i % 3) * 1000;
      // Derive submittedAt as a past date: oldest semester furthest back
      const daysAgo = (uniSemesters.length - j) * 90;
      const submittedAt = addDays(now, -daysAgo);
      process.stdout.write(`    ${s.first} ${s.last} / ${sem.label} (${status})\n`);
      await seedRequest(studentId, studentId, sem, status, amount, submittedAt);
    }

    createdStudents.push({ studentId, uId: s.uId, name: `${s.first} ${s.last}` });
    console.log(`  ✓ ${s.email}`);
  }

  // Graduated + inactive students
  const gradUserId = await upsertUser("graduated@example.com", studentHash, "STUDENT", false);
  const gradStudentId = await upsertStudent(gradUserId, {
    studentId: "STU-2024-0999", firstName: "Ploy", lastName: "Intara",
    universityId: chulaId, degreeProgram: "Economics", yearOfStudy: "4",
    currentSemesterLabel: "Spring 2026", gpa: 3.8, status: "GRADUATED",
  });
  console.log("  ✓ graduated@example.com");

  const inactiveUserId = await upsertUser("inactive@example.com", studentHash, "STUDENT", false);
  await upsertStudent(inactiveUserId, {
    studentId: "STU-2024-0888", firstName: "Wanida", lastName: "Thongchai",
    universityId: mahidolId, degreeProgram: "Medicine", yearOfStudy: "2",
    currentSemesterLabel: "Fall 2026", gpa: 3.4, status: "INACTIVE",
  });
  console.log("  ✓ inactive@example.com");

  console.log("\nSeed complete.");
  console.log("  Admin:   admin@example.com / password123");
  console.log("  Student: somchai.jaidee@example.com / password123");
  console.log(`  ${createdStudents.length} active students + 2 inactive/graduated`);
}

await main().catch((e) => { console.error(e); process.exit(1); }).finally(() => client.release());
await pool.end();
