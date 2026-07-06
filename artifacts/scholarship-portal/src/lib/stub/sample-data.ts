/**
 * In-memory sample data for the client-only build of the Scholarship Portal.
 * Mirrors the Prisma models closely enough that the converted pages can format
 * dates/decimals the same way (Date objects + numbers with .toString()).
 */

const d = (s: string) => new Date(s);

export type Any = any;

// ---------------------------------------------------------------------------
// Raw data
// ---------------------------------------------------------------------------

const rawUniversities = [
  {
    id: "uni_chula",
    name: "Chulalongkorn University",
    city: "Bangkok",
    country: "Thailand",
    addressLine: "254 Phayathai Rd, Pathum Wan",
    websiteUrl: "https://www.chula.ac.th",
    imageUrl:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=60",
    hasSummerSemester: true,
    isActive: true,
    notes: "Flagship partner university in central Bangkok.",
    createdAt: d("2021-03-14T08:00:00Z"),
    updatedAt: d("2024-08-01T08:00:00Z"),
  },
  {
    id: "uni_cmu",
    name: "Chiang Mai University",
    city: "Chiang Mai",
    country: "Thailand",
    addressLine: "239 Huay Kaew Rd, Suthep",
    websiteUrl: "https://www.cmu.ac.th",
    imageUrl:
      "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=60",
    hasSummerSemester: false,
    isActive: true,
    notes: null,
    createdAt: d("2022-01-10T08:00:00Z"),
    updatedAt: d("2024-08-01T08:00:00Z"),
  },
  {
    id: "uni_tu",
    name: "Thammasat University",
    city: "Bangkok",
    country: "Thailand",
    addressLine: "2 Prachan Rd, Phra Borom Maha Ratchawang",
    websiteUrl: "https://www.tu.ac.th",
    imageUrl: null,
    hasSummerSemester: true,
    isActive: false,
    notes: "Partnership currently paused.",
    createdAt: d("2020-09-01T08:00:00Z"),
    updatedAt: d("2024-06-01T08:00:00Z"),
  },
] as Any[];

const rawSemesters = [
  {
    id: "sem_chula_fall25",
    universityId: "uni_chula",
    academicYear: "2025",
    termCode: "FALL",
    label: "Fall 2025",
    startDate: d("2025-08-15"),
    endDate: d("2025-12-20"),
    isActive: true,
  },
  {
    id: "sem_chula_spring25",
    universityId: "uni_chula",
    academicYear: "2024",
    termCode: "SPRING",
    label: "Spring 2025",
    startDate: d("2025-01-10"),
    endDate: d("2025-05-20"),
    isActive: true,
  },
  {
    id: "sem_chula_fall24",
    universityId: "uni_chula",
    academicYear: "2024",
    termCode: "FALL",
    label: "Fall 2024",
    startDate: d("2024-08-15"),
    endDate: d("2024-12-20"),
    isActive: true,
  },
  {
    id: "sem_cmu_fall25",
    universityId: "uni_cmu",
    academicYear: "2025",
    termCode: "FALL",
    label: "Fall 2025",
    startDate: d("2025-08-01"),
    endDate: d("2025-12-15"),
    isActive: true,
  },
  {
    id: "sem_cmu_spring25",
    universityId: "uni_cmu",
    academicYear: "2024",
    termCode: "SPRING",
    label: "Spring 2025",
    startDate: d("2025-01-05"),
    endDate: d("2025-05-15"),
    isActive: true,
  },
  {
    id: "sem_tu_fall25",
    universityId: "uni_tu",
    academicYear: "2025",
    termCode: "FALL",
    label: "Fall 2025",
    startDate: d("2025-08-10"),
    endDate: d("2025-12-18"),
    isActive: false,
  },
] as Any[];

const rawPrograms = [
  { id: "prog_chula_ce", universityId: "uni_chula", name: "Computer Engineering", isActive: true },
  { id: "prog_chula_ba", universityId: "uni_chula", name: "Business Administration", isActive: true },
  { id: "prog_chula_med", universityId: "uni_chula", name: "Medicine", isActive: true },
  { id: "prog_chula_arch", universityId: "uni_chula", name: "Architecture", isActive: false },
  { id: "prog_cmu_cs", universityId: "uni_cmu", name: "Computer Science", isActive: true },
  { id: "prog_cmu_eco", universityId: "uni_cmu", name: "Economics", isActive: true },
  { id: "prog_cmu_nur", universityId: "uni_cmu", name: "Nursing", isActive: true },
  { id: "prog_tu_law", universityId: "uni_tu", name: "Law", isActive: true },
  { id: "prog_tu_pol", universityId: "uni_tu", name: "Political Science", isActive: true },
] as Any[];

const rawUsers = [
  { id: "usr_admin", email: "admin@scholarship.example.com", role: "ADMIN" },
  { id: "usr_current", email: "somchai@student.example.com", role: "STUDENT" },
  { id: "usr_2", email: "malee@student.example.com", role: "STUDENT" },
  { id: "usr_3", email: "anan@student.example.com", role: "STUDENT" },
  { id: "usr_4", email: "nong@student.example.com", role: "STUDENT" },
  { id: "usr_5", email: "kanya@student.example.com", role: "STUDENT" },
  { id: "usr_6", email: "prasert@student.example.com", role: "STUDENT" },
] as Any[];

const rawStudents = [
  {
    id: "stu_current",
    userId: "usr_current",
    studentId: "STU-2024-001",
    firstName: "Somchai",
    lastName: "Jaidee",
    phone: "+66 81 234 5678",
    universityId: "uni_chula",
    degreeProgram: "Computer Engineering",
    yearOfStudy: "3",
    currentSemesterLabel: "Fall 2025",
    gpa: 3.75,
    photoUrl: null,
    status: "ACTIVE",
    createdAt: d("2022-06-01T08:00:00Z"),
    updatedAt: d("2024-08-01T08:00:00Z"),
  },
  {
    id: "stu_2",
    userId: "usr_2",
    studentId: "STU-2024-002",
    firstName: "Malee",
    lastName: "Srisuk",
    phone: "+66 82 345 6789",
    universityId: "uni_chula",
    degreeProgram: "Business Administration",
    yearOfStudy: "2",
    currentSemesterLabel: "Fall 2025",
    gpa: 3.42,
    photoUrl: null,
    status: "ACTIVE",
    createdAt: d("2023-06-01T08:00:00Z"),
    updatedAt: d("2024-08-01T08:00:00Z"),
  },
  {
    id: "stu_3",
    userId: "usr_3",
    studentId: "STU-2023-014",
    firstName: "Anan",
    lastName: "Wong",
    phone: "+66 83 456 7890",
    universityId: "uni_cmu",
    degreeProgram: "Computer Science",
    yearOfStudy: "4",
    currentSemesterLabel: "Fall 2025",
    gpa: 3.9,
    photoUrl: null,
    status: "ACTIVE",
    createdAt: d("2021-06-01T08:00:00Z"),
    updatedAt: d("2024-08-01T08:00:00Z"),
  },
  {
    id: "stu_4",
    userId: "usr_4",
    studentId: "STU-2024-021",
    firstName: "Nong",
    lastName: "Phet",
    phone: null,
    universityId: "uni_cmu",
    degreeProgram: "Economics",
    yearOfStudy: "1",
    currentSemesterLabel: "Fall 2025",
    gpa: 3.1,
    photoUrl: null,
    status: "ACTIVE",
    createdAt: d("2024-06-01T08:00:00Z"),
    updatedAt: d("2024-08-01T08:00:00Z"),
  },
  {
    id: "stu_5",
    userId: "usr_5",
    studentId: "STU-2022-009",
    firstName: "Kanya",
    lastName: "Chai",
    phone: "+66 85 678 9012",
    universityId: "uni_chula",
    degreeProgram: "Medicine",
    yearOfStudy: "5",
    currentSemesterLabel: "Spring 2025",
    gpa: 3.65,
    photoUrl: null,
    status: "GRADUATED",
    createdAt: d("2020-06-01T08:00:00Z"),
    updatedAt: d("2024-08-01T08:00:00Z"),
  },
  {
    id: "stu_6",
    userId: "usr_6",
    studentId: "STU-2021-030",
    firstName: "Prasert",
    lastName: "Boon",
    phone: null,
    universityId: "uni_tu",
    degreeProgram: "Law",
    yearOfStudy: "6",
    currentSemesterLabel: null,
    gpa: 2.85,
    photoUrl: null,
    status: "INACTIVE",
    createdAt: d("2019-06-01T08:00:00Z"),
    updatedAt: d("2024-08-01T08:00:00Z"),
  },
] as Any[];

const rawBank: Record<string, Any> = {
  stu_current: {
    id: "bank_current",
    studentId: "stu_current",
    bankAccountName: "Somchai Jaidee",
    bankAccountNumber: "123-4-56789-0",
    bankName: "Bangkok Bank",
    promptpayNumber: "0812345678",
    qrPaymentImageUrl: null,
    lastUpdatedAt: d("2024-08-01T08:00:00Z"),
  },
  stu_2: {
    id: "bank_2",
    studentId: "stu_2",
    bankAccountName: "Malee Srisuk",
    bankAccountNumber: "234-5-67890-1",
    bankName: "Kasikorn Bank",
    promptpayNumber: "0823456789",
    qrPaymentImageUrl: null,
    lastUpdatedAt: d("2024-08-01T08:00:00Z"),
  },
  stu_3: {
    id: "bank_3",
    studentId: "stu_3",
    bankAccountName: "Anan Wong",
    bankAccountNumber: "345-6-78901-2",
    bankName: "Siam Commercial Bank",
    promptpayNumber: null,
    qrPaymentImageUrl: null,
    lastUpdatedAt: d("2024-08-01T08:00:00Z"),
  },
  stu_5: {
    id: "bank_5",
    studentId: "stu_5",
    bankAccountName: "Kanya Chai",
    bankAccountNumber: "456-7-89012-3",
    bankName: "Bangkok Bank",
    promptpayNumber: "0856789012",
    qrPaymentImageUrl: null,
    lastUpdatedAt: d("2024-08-01T08:00:00Z"),
  },
};

function makeReport(over: Any): Any {
  return {
    id: `rep_${over.tuitionPaymentRequestId}`,
    studentId: over.studentId,
    tuitionPaymentRequestId: over.tuitionPaymentRequestId,
    semesterLabel: over.semesterLabel,
    gpa: 3.5,
    creditsCompleted: 18,
    passedAllCourses: true,
    transcriptFileUrl: "stu/transcripts/sample-transcript.pdf",
    wellbeingPhysical: 4,
    wellbeingMental: 3,
    wellbeingFinancial: 2,
    wellbeingStress: 3,
    wellbeingConfidence: 4,
    challenges: ["financial", "mental_health"],
    activities: ["volunteering", "part_time_work"],
    reflectionAchievement: "Completed a capstone project ahead of schedule.",
    reflectionChallenge: "Balancing part-time work with a heavy course load.",
    reflectionAdditional: "Grateful for the scholarship support this semester.",
    universitySemesterId: over.universitySemesterId ?? null,
    submittedAt: over.submittedAt,
    createdAt: over.submittedAt,
    updatedAt: over.submittedAt,
    ...over.reportOverrides,
  };
}

const rawRequests = [
  {
    id: "req_1",
    studentId: "stu_current",
    semesterLabel: "Fall 2024",
    amountDue: 45000,
    dueDate: d("2024-08-31"),
    invoiceFileUrl: "stu/invoices/fall-2024-invoice.pdf",
    status: "PAID",
    adminNotes: "Verified and paid on time.",
    bankAccountName: "Somchai Jaidee",
    bankAccountNumber: "123-4-56789-0",
    bankName: "Bangkok Bank",
    promptpayNumber: "0812345678",
    qrPaymentImageUrl: "stu/qr/fall-2024-qr.png",
    universitySemesterId: "sem_chula_fall24",
    submittedAt: d("2024-08-10T09:00:00Z"),
    reviewedAt: d("2024-08-12T09:00:00Z"),
    approvedAt: d("2024-08-14T09:00:00Z"),
    paidAt: d("2024-08-20T09:00:00Z"),
    rejectedAt: null,
    createdAt: d("2024-08-10T09:00:00Z"),
    hasReport: true,
    hasPayment: true,
  },
  {
    id: "req_2",
    studentId: "stu_current",
    semesterLabel: "Spring 2025",
    amountDue: 46000,
    dueDate: d("2025-01-31"),
    invoiceFileUrl: "stu/invoices/spring-2025-invoice.pdf",
    status: "REJECTED",
    adminNotes: "Invoice did not match the enrolled program. Please resubmit.",
    bankAccountName: "Somchai Jaidee",
    bankAccountNumber: "123-4-56789-0",
    bankName: "Bangkok Bank",
    promptpayNumber: "0812345678",
    qrPaymentImageUrl: null,
    universitySemesterId: "sem_chula_spring25",
    submittedAt: d("2025-01-12T09:00:00Z"),
    reviewedAt: d("2025-01-14T09:00:00Z"),
    approvedAt: null,
    paidAt: null,
    rejectedAt: d("2025-01-16T09:00:00Z"),
    createdAt: d("2025-01-12T09:00:00Z"),
    hasReport: true,
    hasPayment: false,
  },
  {
    id: "req_3",
    studentId: "stu_2",
    semesterLabel: "Fall 2025",
    amountDue: 38000,
    dueDate: d("2025-08-31"),
    invoiceFileUrl: "stu/invoices/malee-fall-2025.pdf",
    status: "SUBMITTED",
    adminNotes: null,
    bankAccountName: "Malee Srisuk",
    bankAccountNumber: "234-5-67890-1",
    bankName: "Kasikorn Bank",
    promptpayNumber: "0823456789",
    qrPaymentImageUrl: null,
    universitySemesterId: "sem_chula_fall25",
    submittedAt: d("2025-08-05T09:00:00Z"),
    reviewedAt: null,
    approvedAt: null,
    paidAt: null,
    rejectedAt: null,
    createdAt: d("2025-08-05T09:00:00Z"),
    hasReport: true,
    hasPayment: false,
  },
  {
    id: "req_4",
    studentId: "stu_3",
    semesterLabel: "Fall 2025",
    amountDue: 30000,
    dueDate: d("2025-08-25"),
    invoiceFileUrl: "stu/invoices/anan-fall-2025.pdf",
    status: "UNDER_REVIEW",
    adminNotes: "Checking transcript details.",
    bankAccountName: "Anan Wong",
    bankAccountNumber: "345-6-78901-2",
    bankName: "Siam Commercial Bank",
    promptpayNumber: null,
    qrPaymentImageUrl: null,
    universitySemesterId: "sem_cmu_fall25",
    submittedAt: d("2025-08-03T09:00:00Z"),
    reviewedAt: d("2025-08-06T09:00:00Z"),
    approvedAt: null,
    paidAt: null,
    rejectedAt: null,
    createdAt: d("2025-08-03T09:00:00Z"),
    hasReport: true,
    hasPayment: false,
  },
  {
    id: "req_5",
    studentId: "stu_3",
    semesterLabel: "Spring 2025",
    amountDue: 30000,
    dueDate: d("2025-01-25"),
    invoiceFileUrl: "stu/invoices/anan-spring-2025.pdf",
    status: "APPROVED",
    adminNotes: "Approved, awaiting disbursement.",
    bankAccountName: "Anan Wong",
    bankAccountNumber: "345-6-78901-2",
    bankName: "Siam Commercial Bank",
    promptpayNumber: null,
    qrPaymentImageUrl: null,
    universitySemesterId: "sem_cmu_spring25",
    submittedAt: d("2025-01-08T09:00:00Z"),
    reviewedAt: d("2025-01-10T09:00:00Z"),
    approvedAt: d("2025-01-13T09:00:00Z"),
    paidAt: null,
    rejectedAt: null,
    createdAt: d("2025-01-08T09:00:00Z"),
    hasReport: true,
    hasPayment: false,
  },
  {
    id: "req_6",
    studentId: "stu_4",
    semesterLabel: "Fall 2025",
    amountDue: 28000,
    dueDate: d("2025-08-31"),
    invoiceFileUrl: null,
    status: "SUBMITTED",
    adminNotes: null,
    bankAccountName: "Nong Phet",
    bankAccountNumber: "567-8-90123-4",
    bankName: "Krungthai Bank",
    promptpayNumber: null,
    qrPaymentImageUrl: null,
    universitySemesterId: "sem_cmu_fall25",
    submittedAt: d("2025-08-07T09:00:00Z"),
    reviewedAt: null,
    approvedAt: null,
    paidAt: null,
    rejectedAt: null,
    createdAt: d("2025-08-07T09:00:00Z"),
    hasReport: false,
    hasPayment: false,
  },
  {
    id: "req_7",
    studentId: "stu_5",
    semesterLabel: "Spring 2025",
    amountDue: 52000,
    dueDate: d("2025-01-20"),
    invoiceFileUrl: "stu/invoices/kanya-spring-2025.pdf",
    status: "PAID",
    adminNotes: "Final semester payment.",
    bankAccountName: "Kanya Chai",
    bankAccountNumber: "456-7-89012-3",
    bankName: "Bangkok Bank",
    promptpayNumber: "0856789012",
    qrPaymentImageUrl: "stu/qr/kanya-spring-2025.png",
    universitySemesterId: "sem_chula_spring25",
    submittedAt: d("2025-01-05T09:00:00Z"),
    reviewedAt: d("2025-01-07T09:00:00Z"),
    approvedAt: d("2025-01-09T09:00:00Z"),
    paidAt: d("2025-01-15T09:00:00Z"),
    rejectedAt: null,
    createdAt: d("2025-01-05T09:00:00Z"),
    hasReport: true,
    hasPayment: true,
  },
  {
    id: "req_8",
    studentId: "stu_2",
    semesterLabel: "Spring 2025",
    amountDue: 38000,
    dueDate: d("2025-01-31"),
    invoiceFileUrl: "stu/invoices/malee-spring-2025.pdf",
    status: "PAID",
    adminNotes: null,
    bankAccountName: "Malee Srisuk",
    bankAccountNumber: "234-5-67890-1",
    bankName: "Kasikorn Bank",
    promptpayNumber: "0823456789",
    qrPaymentImageUrl: null,
    universitySemesterId: "sem_chula_spring25",
    submittedAt: d("2025-01-11T09:00:00Z"),
    reviewedAt: d("2025-01-13T09:00:00Z"),
    approvedAt: d("2025-01-15T09:00:00Z"),
    paidAt: d("2025-01-22T09:00:00Z"),
    rejectedAt: null,
    createdAt: d("2025-01-11T09:00:00Z"),
    hasReport: true,
    hasPayment: true,
  },
] as Any[];

// ---------------------------------------------------------------------------
// Assembly helpers
// ---------------------------------------------------------------------------

function baseUniversity(id: string): Any {
  return rawUniversities.find((u) => u.id === id) ?? null;
}

function semestersOf(universityId: string): Any[] {
  return rawSemesters
    .filter((s) => s.universityId === universityId)
    .map((s) => ({
      ...s,
      _count: {
        tuitionPaymentRequests: rawRequests.filter(
          (r) => r.universitySemesterId === s.id,
        ).length,
      },
    }));
}

function programsOf(universityId: string): Any[] {
  return rawPrograms.filter((p) => p.universityId === universityId);
}

function studentsOf(universityId: string): Any[] {
  return rawStudents.filter((s) => s.universityId === universityId);
}

function userOf(userId: string): Any {
  return rawUsers.find((u) => u.id === userId) ?? null;
}

function bankOf(studentId: string): Any {
  return rawBank[studentId] ?? null;
}

function reportOf(request: Any): Any {
  if (!request.hasReport) return null;
  return makeReport({
    tuitionPaymentRequestId: request.id,
    studentId: request.studentId,
    semesterLabel: request.semesterLabel,
    universitySemesterId: request.universitySemesterId,
  });
}

function paymentOf(request: Any): Any {
  if (!request.hasPayment) return null;
  return {
    id: `pay_${request.id}`,
    studentId: request.studentId,
    tuitionPaymentRequestId: request.id,
    semesterLabel: request.semesterLabel,
    amountPaid: request.amountDue,
    paymentStatus: "PAID",
    paymentDate: request.paidAt ?? request.submittedAt,
    internalNotes: getPaymentNote(request.id) ?? "Disbursed via bank transfer.",
    createdAt: request.paidAt ?? request.submittedAt,
  };
}

// ---------------------------------------------------------------------------
// Payment notes mutable store (for client-only demo writes)
// ---------------------------------------------------------------------------

const paymentNotesStore: Record<string, string> = {};

export function getPaymentNote(requestId: string): string | undefined {
  return paymentNotesStore[requestId];
}

export function setPaymentNote(requestId: string, notes: string | null): void {
  if (notes === null || notes === undefined) {
    delete paymentNotesStore[requestId];
    return;
  }
  paymentNotesStore[requestId] = notes;
}

// ---------------------------------------------------------------------------
// Mutation helpers
// ---------------------------------------------------------------------------

export function updateRequestById(id: string, updates: Partial<Any>): boolean {
  const idx = rawRequests.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  Object.assign(rawRequests[idx], { ...updates, updatedAt: new Date() });
  return true;
}

function studentLite(studentId: string, opts: { university?: boolean; user?: boolean } = {}): Any {
  const s = rawStudents.find((x) => x.id === studentId);
  if (!s) return null;
  const out: Any = { ...s };
  if (opts.university) out.university = baseUniversity(s.universityId);
  if (opts.user) out.user = userOf(s.userId);
  return out;
}

// ---------------------------------------------------------------------------
// Public getters
// ---------------------------------------------------------------------------

export function getUniversities(): Any[] {
  return rawUniversities.map((u) => ({
    ...u,
    semesters: semestersOf(u.id),
    degreePrograms: programsOf(u.id),
    students: studentsOf(u.id).slice(0, 5),
    _count: { students: studentsOf(u.id).length },
  }));
}

export function getUniversity(id: string): Any {
  const u = baseUniversity(id);
  if (!u) return null;
  return {
    ...u,
    semesters: semestersOf(u.id),
    degreePrograms: programsOf(u.id),
    students: studentsOf(u.id).slice(0, 5),
    _count: { students: studentsOf(u.id).length },
  };
}

export function getActiveUniversities(): Any[] {
  return rawUniversities
    .filter((u) => u.isActive)
    .map((u) => ({ id: u.id, name: u.name }));
}

export function getActiveSemesters(): Any[] {
  return rawSemesters
    .filter((s) => s.isActive)
    .map((s) => ({
      id: s.id,
      label: s.label,
      academicYear: s.academicYear,
      universityId: s.universityId,
    }));
}

export function getUniversitySemesters(universityId: string, activeOnly = true): Any[] {
  return rawSemesters.filter(
    (s) => s.universityId === universityId && (!activeOnly || s.isActive),
  );
}

export function getStudents(): Any[] {
  return rawStudents.map((s) => ({
    ...s,
    university: baseUniversity(s.universityId),
    user: userOf(s.userId),
    bankInformation: bankOf(s.id),
  }));
}

export function getStudent(id: string): Any {
  const s = rawStudents.find((x) => x.id === id);
  if (!s) return null;
  return {
    ...s,
    university: baseUniversity(s.universityId),
    user: userOf(s.userId),
    bankInformation: bankOf(s.id),
    tuitionPaymentRequests: getRequestsForStudent(s.id),
  };
}

export function getRequestsForStudent(studentId: string): Any[] {
  return rawRequests
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .map((r) => ({ ...r }));
}

export function getLatestRequestForStudent(studentId: string): Any {
  const list = getRequestsForStudent(studentId);
  return list[0] ?? null;
}

export function getRequests(): Any[] {
  return rawRequests
    .slice()
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .map((r) => ({
      ...r,
      student: studentLite(r.studentId, { university: true, user: true }),
      universitySemester: rawSemesters.find(
        (s) => s.id === r.universitySemesterId,
      ) ?? null,
      paymentHistory: paymentOf(r),
    }));
}

export function getRequest(id: string): Any {
  const r = rawRequests.find((x) => x.id === id);
  if (!r) return null;
  return {
    ...r,
    student: studentLite(r.studentId, { university: true, user: true }),
    universitySemester:
      rawSemesters.find((s) => s.id === r.universitySemesterId) ?? null,
    semesterReport: reportOf(r),
    paymentHistory: paymentOf(r),
  };
}

export function getDistinctSemesterLabels(): Any[] {
  const set = new Set(rawRequests.map((r) => r.semesterLabel));
  return [...set]
    .sort((a, b) => b.localeCompare(a))
    .map((semesterLabel) => ({ semesterLabel }));
}

// Dashboard-oriented getters ------------------------------------------------

export function getDashboardData(): Any {
  return {
    universities: getActiveUniversities(),
    semesters: getActiveSemesters(),
    students: rawStudents.map((s) => ({
      universityId: s.universityId,
      status: s.status,
    })),
    requests: getRequests(),
  };
}

// Session helpers -----------------------------------------------------------

export const CURRENT_ADMIN_USER: Any = {
  id: "usr_admin",
  email: "admin@scholarship.example.com",
  role: "ADMIN",
  displayName: "Admin User",
};

export const CURRENT_STUDENT_USER: Any = {
  id: "usr_current",
  email: "somchai@student.example.com",
  role: "STUDENT",
  studentProfileId: "stu_current",
  firstName: "Somchai",
  lastName: "Jaidee",
  displayName: "Somchai Jaidee",
};

export function getCurrentStudentProfile(): Any {
  const s = rawStudents.find((x) => x.id === "stu_current")!;
  return {
    ...s,
    university: baseUniversity(s.universityId),
    bankInformation: bankOf(s.id),
  };
}
