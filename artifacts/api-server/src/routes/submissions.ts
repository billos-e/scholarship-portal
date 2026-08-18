import { Router, type IRouter } from "express";
import { and, eq, inArray, ne } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  db,
  students,
  tuitionPaymentRequests,
  semesterReports,
  universitySemesters,
  REQUEST_CATEGORY_VALUES,
  type RequestCategory,
} from "@workspace/db";
import { notifyAdminsAfterSubmission } from "../lib/admin-notifications";
import {
  persistSubmissionBankRow,
  resolveSubmissionBankSnapshot,
} from "../lib/bank-accounts";

const router: IRouter = Router();

const OPEN_REQUEST_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] as const;

function parseOptionalBoolean(value: unknown): boolean | null {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
}

function parseUrlList(value: unknown): string[] | null {
  if (typeof value === "string" && value.trim()) return [value.trim()];
  if (!Array.isArray(value)) return null;
  const urls = value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
  return urls.length > 0 ? urls : null;
}

const CATEGORY_LABELS: Record<RequestCategory, string> = {
  TUITION: "tuition",
  LIVING_EXPENSES: "living expenses",
  STUDY_ABROAD_INTERNSHIP: "study abroad / internship",
  EMERGENCY_AID: "emergency aid",
};

function parseRequestCategory(value: unknown): RequestCategory | null {
  if (value == null || value === "") return "TUITION";
  if (
    typeof value === "string" &&
    (REQUEST_CATEGORY_VALUES as readonly string[]).includes(value)
  ) {
    return value as RequestCategory;
  }
  return null;
}

router.post("/submissions", async (req, res) => {
  try {
    const {
      studentId,
      semesterLabel: rawSemesterLabel,
      universitySemesterId,
      amountDue,
      dueDate,
      invoiceFileUrl,
      message,
      qrPaymentImageUrl,
      gpa,
      creditsCompleted,
      withdrawnFromCourses,
      academicComment,
      transcriptFileUrl,
      receivedAcademicExcellenceAward,
      receivedOtherAward,
      awardFileUrls,
      awardsComment,
      wellbeingPhysical,
      wellbeingMental,
      wellbeingFinancial,
      wellbeingStress,
      wellbeingConfidence,
      challenges,
      activities,
      activitiesComment,
      reflectionOvercomeChallenge,
      reflectionMeaningfulExperience,
      reflectionProudAchievement,
      requestCategory: rawRequestCategory,
    } = req.body ?? {};

    if (!studentId) {
      res.status(400).json({ error: "Student ID is required." });
      return;
    }

    if (!amountDue || Number(amountDue) <= 0) {
      res.status(400).json({ error: "Amount is required." });
      return;
    }

    const gpaMissing =
      gpa === undefined ||
      gpa === null ||
      (typeof gpa === "string" && gpa.trim() === "");
    const gpaNum = Number(gpa);
    if (gpaMissing) {
      res.status(400).json({ error: "GPA is required." });
      return;
    }
    if (!Number.isFinite(gpaNum) || gpaNum < 0 || gpaNum > 4) {
      res.status(400).json({ error: "GPA must be a number between 0 and 4." });
      return;
    }

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    // Resolve semester label from universitySemesterId if needed
    let semesterLabel = rawSemesterLabel as string | null;
    if (universitySemesterId) {
      const whereClause = student.universityId
        ? and(
            eq(universitySemesters.id, universitySemesterId),
            eq(universitySemesters.isActive, true),
            eq(universitySemesters.universityId, student.universityId),
          )
        : and(
            eq(universitySemesters.id, universitySemesterId),
            eq(universitySemesters.isActive, true),
          );

      const [sem] = await db
        .select({ label: universitySemesters.label })
        .from(universitySemesters)
        .where(whereClause)
        .limit(1);

      if (!sem) {
        res.status(400).json({ error: "Please select a valid semester for your university." });
        return;
      }
      semesterLabel = sem.label;
    }

    if (!semesterLabel) {
      res.status(400).json({ error: "Semester is required." });
      return;
    }

    const requestCategory = parseRequestCategory(rawRequestCategory);
    if (!requestCategory) {
      res.status(400).json({ error: "Please choose a valid payment category." });
      return;
    }

    const categoryLabel = CATEGORY_LABELS[requestCategory];

    // Block only an OPEN request of the same category (other categories stay allowed).
    const [openRequest] = await db
      .select({
        id: tuitionPaymentRequests.id,
        semesterLabel: tuitionPaymentRequests.semesterLabel,
      })
      .from(tuitionPaymentRequests)
      .where(
        and(
          eq(tuitionPaymentRequests.studentId, studentId),
          eq(tuitionPaymentRequests.requestCategory, requestCategory),
          inArray(tuitionPaymentRequests.status, [...OPEN_REQUEST_STATUSES]),
        ),
      )
      .limit(1);

    if (openRequest) {
      res.status(409).json({
        error: `You already have an open ${categoryLabel} request for ${openRequest.semesterLabel}. Please wait for it to be processed.`,
      });
      return;
    }

    // One non-REJECTED request per category per semester.
    const dupWhere = universitySemesterId
      ? and(
          eq(tuitionPaymentRequests.studentId, studentId),
          eq(tuitionPaymentRequests.requestCategory, requestCategory),
          eq(tuitionPaymentRequests.universitySemesterId, universitySemesterId),
          ne(tuitionPaymentRequests.status, "REJECTED"),
        )
      : and(
          eq(tuitionPaymentRequests.studentId, studentId),
          eq(tuitionPaymentRequests.requestCategory, requestCategory),
          eq(tuitionPaymentRequests.semesterLabel, semesterLabel),
          ne(tuitionPaymentRequests.status, "REJECTED"),
        );

    const [duplicate] = await db
      .select({ semesterLabel: tuitionPaymentRequests.semesterLabel })
      .from(tuitionPaymentRequests)
      .where(dupWhere)
      .limit(1);

    if (duplicate) {
      res.status(409).json({
        error: `You have already submitted a ${categoryLabel} request for ${duplicate.semesterLabel}.`,
      });
      return;
    }

    const now = new Date();
    const requestId = randomUUID();
    const reportId = randomUUID();

    const dueDateParsed = dueDate ? new Date(dueDate) : null;

    const bankResolved = await resolveSubmissionBankSnapshot(
      studentId,
      (req.body ?? {}) as Record<string, unknown>,
    );
    if (!bankResolved.ok) {
      res.status(400).json({ error: bankResolved.error });
      return;
    }
    const { snapshot, accountId } = bankResolved;

    await db.insert(tuitionPaymentRequests).values({
      id: requestId,
      studentId,
      semesterLabel,
      amountDue: String(amountDue),
      dueDate: dueDateParsed && !Number.isNaN(dueDateParsed.getTime()) ? dueDateParsed : null,
      invoiceFileUrl: (invoiceFileUrl as string) || null,
      message: (message as string)?.trim() || null,
      requestCategory,
      status: "SUBMITTED",
      bankAccountName: snapshot.bankAccountName,
      bankAccountNumber: snapshot.bankAccountNumber,
      bankName: snapshot.bankName,
      promptpayNumber: snapshot.promptpayNumber,
      qrPaymentImageUrl: snapshot.qrPaymentImageUrl || (qrPaymentImageUrl as string) || null,
      universitySemesterId: (universitySemesterId as string) || null,
      submittedAt: now,
      updatedAt: now,
    });

    await db.insert(semesterReports).values({
      id: reportId,
      studentId,
      tuitionPaymentRequestId: requestId,
      semesterLabel,
      gpa: String(gpaNum),
      creditsCompleted: creditsCompleted != null ? Number(creditsCompleted) : null,
      withdrawnFromCourses: withdrawnFromCourses != null ? Boolean(withdrawnFromCourses) : null,
      academicComment: (academicComment as string)?.trim() || null,
      transcriptFileUrl: (transcriptFileUrl as string) || null,
      receivedAcademicExcellenceAward: parseOptionalBoolean(
        receivedAcademicExcellenceAward,
      ),
      receivedOtherAward: parseOptionalBoolean(receivedOtherAward),
      awardFileUrls: parseUrlList(awardFileUrls),
      awardsComment: (awardsComment as string)?.trim() || null,
      wellbeingPhysical: wellbeingPhysical != null ? Number(wellbeingPhysical) : null,
      wellbeingMental: wellbeingMental != null ? Number(wellbeingMental) : null,
      wellbeingFinancial: wellbeingFinancial != null ? Number(wellbeingFinancial) : null,
      wellbeingStress: wellbeingStress != null ? Number(wellbeingStress) : null,
      wellbeingConfidence: wellbeingConfidence != null ? Number(wellbeingConfidence) : null,
      challenges: Array.isArray(challenges) ? challenges : [],
      activities: Array.isArray(activities) ? activities : [],
      activitiesComment: (activitiesComment as string)?.trim() || null,
      reflectionOvercomeChallenge:
        (reflectionOvercomeChallenge as string)?.trim() || null,
      reflectionMeaningfulExperience:
        (reflectionMeaningfulExperience as string)?.trim() || null,
      reflectionProudAchievement:
        (reflectionProudAchievement as string)?.trim() || null,
      universitySemesterId: (universitySemesterId as string) || null,
      submittedAt: now,
      updatedAt: now,
    });

    await persistSubmissionBankRow(studentId, accountId, snapshot);

    // Set currentSemesterLabel if not already set
    if (!student.currentSemesterLabel) {
      await db
        .update(students)
        .set({ currentSemesterLabel: semesterLabel, updatedAt: now } as any)
        .where(eq(students.id, studentId));
    }

    await notifyAdminsAfterSubmission({
      requestId,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      studentCode: student.studentId,
      semesterLabel,
      requestCategory,
      gpa: String(gpaNum),
    });

    res.status(201).json({ requestId, ok: true });
  } catch (err) {
    console.error("POST /submissions error", err);
    res.status(500).json({ error: "Could not save your submission. Please try again." });
  }
});

export default router;
