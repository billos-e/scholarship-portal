import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const roleEnum = pgEnum("role", ["STUDENT", "ADMIN"]);
export const studentStatusEnum = pgEnum("student_status", [
  "ACTIVE",
  "GRADUATED",
  "INACTIVE",
]);
export const requestStatusEnum = pgEnum("request_status", [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "PAID",
  "REJECTED",
]);
export const REQUEST_CATEGORY_VALUES = [
  "TUITION",
  "LIVING_EXPENSES",
  "STUDY_ABROAD_INTERNSHIP",
  "EMERGENCY_AID",
] as const;
export type RequestCategory = (typeof REQUEST_CATEGORY_VALUES)[number];
export const requestCategoryEnum = pgEnum(
  "request_category",
  REQUEST_CATEGORY_VALUES,
);
export const termCodeEnum = pgEnum("term_code", [
  "FALL",
  "SPRING",
  "SUMMER",
  "WINTER",
]);

/** Student's overall scholarship — not a payment-request category. */
export const SCHOLARSHIP_TYPE_VALUES = [
  "TUITION",
  "LIVING_EXPENSES",
  "FULL_SCHOLARSHIP",
] as const;
export type ScholarshipType = (typeof SCHOLARSHIP_TYPE_VALUES)[number];
export const scholarshipTypeEnum = pgEnum(
  "scholarship_type",
  SCHOLARSHIP_TYPE_VALUES,
);

export const RELIGION_VALUES = [
  "CHRISTIAN",
  "BUDDHIST",
  "ANIMIST",
  "NONE",
] as const;
export type Religion = (typeof RELIGION_VALUES)[number];
export const religionEnum = pgEnum("religion", RELIGION_VALUES);

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

export const universities = pgTable("universities", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  city: text("city"),
  country: text("country"),
  addressLine: text("address_line"),
  websiteUrl: text("website_url"),
  imageUrl: text("image_url"),
  hasSummerSemester: boolean("has_summer_semester").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const degreePrograms = pgTable(
  "degree_programs",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => universities.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("degree_programs_university_name_idx").on(t.universityId, t.name),
    index("degree_programs_university_id_idx").on(t.universityId),
  ],
);

export const universitySemesters = pgTable(
  "university_semesters",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => universities.id, { onDelete: "cascade" }),
    academicYear: text("academic_year").notNull(),
    termCode: termCodeEnum("term_code").notNull(),
    label: text("label").notNull(),
    startDate: timestamp("start_date", { withTimezone: false }).notNull(),
    endDate: timestamp("end_date", { withTimezone: false }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("university_semesters_university_id_idx").on(t.universityId),
    index("university_semesters_start_date_idx").on(t.startDate),
  ],
);

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("STUDENT"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Business profile
// ---------------------------------------------------------------------------

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  studentId: text("student_id").unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  universityId: text("university_id").references(() => universities.id),
  degreeProgram: text("degree_program"),
  yearOfStudy: text("year_of_study"),
  currentSemesterLabel: text("current_semester_label"),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  photoUrl: text("photo_url"),
  scholarshipType: scholarshipTypeEnum("scholarship_type"),
  graduationYear: integer("graduation_year"),
  religion: religionEnum("religion"),
  ethnicity: text("ethnicity").array(),
  status: studentStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bankInformation = pgTable("bank_information", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: "cascade" }),
  bankAccountName: text("bank_account_name"),
  bankAccountNumber: text("bank_account_number"),
  bankName: text("bank_name"),
  promptpayNumber: text("promptpay_number"),
  qrPaymentImageUrl: text("qr_payment_image_url"),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Semester submission
// ---------------------------------------------------------------------------

export const tuitionPaymentRequests = pgTable(
  "tuition_payment_requests",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    semesterLabel: text("semester_label").notNull(),
    amountDue: decimal("amount_due", { precision: 10, scale: 2 }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: false }),
    invoiceFileUrl: text("invoice_file_url"),
    message: text("message"),
    requestCategory: requestCategoryEnum("request_category")
      .notNull()
      .default("TUITION"),
    status: requestStatusEnum("status").notNull().default("SUBMITTED"),
    adminNotes: text("admin_notes"),
    bankAccountName: text("bank_account_name"),
    bankAccountNumber: text("bank_account_number"),
    bankName: text("bank_name"),
    promptpayNumber: text("promptpay_number"),
    qrPaymentImageUrl: text("qr_payment_image_url"),
    universitySemesterId: text("university_semester_id").references(
      () => universitySemesters.id,
    ),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tpr_student_id_idx").on(t.studentId),
    index("tpr_status_idx").on(t.status),
    index("tpr_semester_label_idx").on(t.semesterLabel),
    index("tpr_request_category_idx").on(t.requestCategory),
    index("tpr_student_category_status_idx").on(
      t.studentId,
      t.requestCategory,
      t.status,
    ),
    uniqueIndex("tpr_student_semester_category_active_idx")
      .on(t.studentId, t.semesterLabel, t.requestCategory)
      .where(sql`${t.status} <> 'REJECTED'`),
  ],
);

export const semesterReports = pgTable(
  "semester_reports",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    tuitionPaymentRequestId: text("tuition_payment_request_id")
      .notNull()
      .unique()
      .references(() => tuitionPaymentRequests.id, { onDelete: "cascade" }),
    semesterLabel: text("semester_label").notNull(),
    gpa: decimal("gpa", { precision: 3, scale: 2 }),
    creditsCompleted: integer("credits_completed"),
    withdrawnFromCourses: boolean("withdrawn_from_courses"),
    academicComment: text("academic_comment"),
    transcriptFileUrl: text("transcript_file_url"),
    wellbeingPhysical: integer("wellbeing_physical"),
    wellbeingMental: integer("wellbeing_mental"),
    wellbeingFinancial: integer("wellbeing_financial"),
    wellbeingStress: integer("wellbeing_stress"),
    wellbeingConfidence: integer("wellbeing_confidence"),
    challenges: text("challenges").array(),
    activities: text("activities").array(),
    reflectionAchievement: text("reflection_achievement"),
    reflectionChallenge: text("reflection_challenge"),
    reflectionAdditional: text("reflection_additional"),
    universitySemesterId: text("university_semester_id").references(
      () => universitySemesters.id,
    ),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("semester_reports_student_id_idx").on(t.studentId)],
);

export const paymentHistory = pgTable(
  "payment_history",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    tuitionPaymentRequestId: text("tuition_payment_request_id")
      .notNull()
      .unique()
      .references(() => tuitionPaymentRequests.id, { onDelete: "cascade" }),
    semesterLabel: text("semester_label").notNull(),
    amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: text("payment_status").notNull().default("PAID"),
    paymentDate: timestamp("payment_date", { withTimezone: false }).notNull(),
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("payment_history_student_id_idx").on(t.studentId)],
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type University = typeof universities.$inferSelect;
export type InsertUniversity = typeof universities.$inferInsert;
export type DegreeProgram = typeof degreePrograms.$inferSelect;
export type UniversitySemester = typeof universitySemesters.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Student = typeof students.$inferSelect;
export type BankInformation = typeof bankInformation.$inferSelect;
export type TuitionPaymentRequest = typeof tuitionPaymentRequests.$inferSelect;
export type SemesterReport = typeof semesterReports.$inferSelect;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
