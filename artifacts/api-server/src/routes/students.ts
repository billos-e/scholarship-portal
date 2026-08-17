import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { and, asc, count, desc, eq, ilike, isNull, ne, or, type SQL } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  db,
  students,
  users,
  bankInformation,
  universities,
  tuitionPaymentRequests,
  SCHOLARSHIP_TYPE_VALUES,
  RELIGION_VALUES,
  type ScholarshipType,
  type Religion,
} from "@workspace/db";
import {
  attachBankFields,
  fetchBankAccountsForStudents,
  fetchStudentBankAccounts,
  noCompleteBankSql,
  parseBankAccountsBody,
  parseLegacyBankFields,
  replaceStudentBankAccounts,
  upsertPrimaryBankAccount,
} from "../lib/bank-accounts";

const router: IRouter = Router();

const STUDENT_SORT_COLUMNS = {
  name: students.firstName,
  studentId: students.studentId,
  university: universities.name,
  program: students.degreeProgram,
  status: students.status,
} as const;

type StudentSortKey = keyof typeof STUDENT_SORT_COLUMNS;

function parseOptionalEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): { ok: true; value: T | null } | { ok: false; error: string } {
  if (value == null || value === "") return { ok: true, value: null };
  if (typeof value === "string" && (allowed as readonly string[]).includes(value)) {
    return { ok: true, value: value as T };
  }
  return { ok: false, error: `Invalid ${field}.` };
}

function parseGraduationYear(
  value: unknown,
): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value == null || value === "") return { ok: true, value: null };
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(n) || n < 1990 || n > 2100) {
    return { ok: false, error: "Graduation year must be a valid calendar year." };
  }
  return { ok: true, value: n };
}

function parseEthnicity(
  value: unknown,
): { ok: true; value: string[] | null } | { ok: false; error: string } {
  if (value == null || value === "") return { ok: true, value: null };
  let items: unknown[];
  if (Array.isArray(value)) {
    items = value;
  } else if (typeof value === "string") {
    items = value.includes(",") || value.includes(";")
      ? value.split(/[,;]/)
      : [value];
  } else {
    return { ok: false, error: "Ethnicity must be a list of values." };
  }
  const cleaned = [
    ...new Set(items.map((item) => String(item).trim()).filter(Boolean)),
  ];
  return { ok: true, value: cleaned.length > 0 ? cleaned : null };
}

async function generateUniqueStudentId(): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 10; attempt++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidate = `STU-${year}-${String(num).padStart(4, "0")}`;
    const [existing] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.studentId, candidate))
      .limit(1);
    if (!existing) return candidate;
  }
  return `STU-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function incompleteProfileCondition(): SQL {
  return or(
    isNull(students.studentId),
    eq(students.studentId, ""),
    isNull(students.universityId),
    isNull(students.degreeProgram),
    eq(students.degreeProgram, ""),
    isNull(students.yearOfStudy),
    eq(students.yearOfStudy, ""),
    isNull(students.currentSemesterLabel),
    eq(students.currentSemesterLabel, ""),
    isNull(students.gpa),
    noCompleteBankSql,
  ) as SQL;
}

function parsePagination(req: { query: Record<string, unknown> }) {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String(req.query.limit ?? "20"), 10) || 20),
  );
  return { page, limit, offset: (page - 1) * limit };
}

router.get("/students", async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const uni = typeof req.query.uni === "string" ? req.query.uni : "";
    const program = typeof req.query.program === "string" ? req.query.program : "";
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const incompleteProfile = req.query.incompleteProfile === "true";
    const sortKeyParam = typeof req.query.sortKey === "string" ? req.query.sortKey : "";
    const sortDir = req.query.sortDir === "desc" ? "desc" : "asc";
    const sortKey: StudentSortKey | null =
      sortKeyParam in STUDENT_SORT_COLUMNS ? (sortKeyParam as StudentSortKey) : null;

    const conditions: SQL[] = [];
    if (search) {
      const needle = `%${search}%`;
      conditions.push(
        or(
          ilike(students.firstName, needle),
          ilike(students.lastName, needle),
          ilike(students.studentId, needle),
        ) as SQL,
      );
    }
    if (uni) conditions.push(eq(students.universityId, uni));
    if (program) conditions.push(eq(students.degreeProgram, program));
    if (status && ["ACTIVE", "GRADUATED", "INACTIVE"].includes(status)) {
      conditions.push(eq(students.status, status as "ACTIVE" | "GRADUATED" | "INACTIVE"));
    }
    if (incompleteProfile) {
      conditions.push(incompleteProfileCondition());
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const baseQuery = db
      .select({
        student: students,
        university: universities,
        userEmail: users.email,
        userRole: users.role,
      })
      .from(students)
      .leftJoin(universities, eq(students.universityId, universities.id))
      .innerJoin(users, eq(students.userId, users.id));

    const orderColumn = sortKey ? STUDENT_SORT_COLUMNS[sortKey] : students.createdAt;
    const orderBy = sortKey
      ? sortDir === "desc"
        ? desc(orderColumn)
        : asc(orderColumn)
      : desc(students.createdAt);

    const [rows, [{ value: total }]] = await Promise.all([
      (where ? baseQuery.where(where) : baseQuery)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      (() => {
        const q = db.select({ value: count() }).from(students);
        return where ? q.where(where) : q;
      })(),
    ]);

    const [totalCountRows, activeCountRows, incompleteCountRows] =
      await Promise.all([
        db.select({ value: count() }).from(students),
        db
          .select({ value: count() })
          .from(students)
          .where(eq(students.status, "ACTIVE")),
        db
          .select({ value: count() })
          .from(students)
          .where(incompleteProfileCondition()),
      ]);
    const totalCount = totalCountRows[0].value;
    const activeCount = activeCountRows[0].value;
    const incompleteCount = incompleteCountRows[0].value;

    const banksByStudent = await fetchBankAccountsForStudents(
      rows.map((r) => r.student.id),
    );

    const items = rows.map((r) =>
      attachBankFields(
        {
          ...r.student,
          university: r.university ?? null,
          user: { email: r.userEmail, role: r.userRole },
        },
        banksByStudent.get(r.student.id) ?? [],
      ),
    );

    res.json({
      items,
      total: Number(total),
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(Number(total) / limit)),
      summary: {
        totalEnrolled: Number(totalCount),
        active: Number(activeCount),
        incompleteProfile: Number(incompleteCount),
      },
    });
  } catch (err) {
    console.error("GET /students error", err);
    res.status(500).json({ error: "Failed to fetch students." });
  }
});

router.get("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [row] = await db
      .select({
        student: students,
        university: universities,
        userEmail: users.email,
        userRole: users.role,
      })
      .from(students)
      .leftJoin(universities, eq(students.universityId, universities.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    const [requests, accounts] = await Promise.all([
      db
        .select()
        .from(tuitionPaymentRequests)
        .where(eq(tuitionPaymentRequests.studentId, id))
        .orderBy(desc(tuitionPaymentRequests.submittedAt)),
      fetchStudentBankAccounts(id),
    ]);

    res.json(
      attachBankFields(
        {
          ...row.student,
          university: row.university ?? null,
          user: { email: row.userEmail, role: row.userRole },
          tuitionPaymentRequests: requests,
        },
        accounts,
      ),
    );
  } catch (err) {
    console.error("GET /students/:id error", err);
    res.status(500).json({ error: "Failed to fetch student." });
  }
});

router.post("/students", async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      studentId,
      phone,
      universityId,
      degreeProgram,
      yearOfStudy,
      currentSemesterLabel,
      gpa,
      status,
      scholarshipType,
      graduationYear,
      religion,
      ethnicity,
    } = req.body ?? {};

    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required." });
      return;
    }
    if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
      res.status(400).json({ error: "First name is required." });
      return;
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters." });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    if (studentId) {
      const [dupStudentId] = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.studentId, studentId))
        .limit(1);
      if (dupStudentId) {
        res.status(409).json({ error: "This Student ID is already in use." });
        return;
      }
    }

    const parsedScholarshipType = parseOptionalEnum(
      scholarshipType,
      SCHOLARSHIP_TYPE_VALUES,
      "scholarship type",
    );
    if (!parsedScholarshipType.ok) {
      res.status(400).json({ error: parsedScholarshipType.error });
      return;
    }
    const parsedReligion = parseOptionalEnum(religion, RELIGION_VALUES, "religion");
    if (!parsedReligion.ok) {
      res.status(400).json({ error: parsedReligion.error });
      return;
    }
    const parsedGraduationYear = parseGraduationYear(graduationYear);
    if (!parsedGraduationYear.ok) {
      res.status(400).json({ error: parsedGraduationYear.error });
      return;
    }
    const parsedEthnicity = parseEthnicity(ethnicity);
    if (!parsedEthnicity.ok) {
      res.status(400).json({ error: parsedEthnicity.error });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = randomUUID();
    const studentDbId = randomUUID();
    const bankId = randomUUID();
    const studentStatus = (["ACTIVE", "GRADUATED", "INACTIVE"].includes(status) ? status : "ACTIVE") as "ACTIVE" | "GRADUATED" | "INACTIVE";

    const resolvedStudentId =
      (studentId as string)?.trim() || (await generateUniqueStudentId());

    await db.insert(users).values({
      id: userId,
      email: emailLower,
      passwordHash,
      role: "STUDENT",
      isActive: studentStatus === "ACTIVE",
    });

    await db.insert(students).values({
      id: studentDbId,
      userId,
      firstName: firstName.trim(),
      lastName: (lastName as string)?.trim() || "",
      studentId: resolvedStudentId,
      phone: (phone as string)?.trim() || null,
      universityId: (universityId as string) || null,
      degreeProgram: (degreeProgram as string)?.trim() || null,
      yearOfStudy: (yearOfStudy as string)?.trim() || null,
      currentSemesterLabel: (currentSemesterLabel as string)?.trim() || null,
      gpa: (gpa as string)?.trim() || null,
      scholarshipType: parsedScholarshipType.value as ScholarshipType | null,
      graduationYear: parsedGraduationYear.value,
      religion: parsedReligion.value as Religion | null,
      ethnicity: parsedEthnicity.value,
      status: studentStatus,
    });

    await db.insert(bankInformation).values({
      id: bankId,
      studentId: studentDbId,
      sortOrder: 1,
    });

    res.status(201).json({ id: studentDbId, userId });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    console.error("POST /students error", err);
    res.status(500).json({ error: "Failed to create student." });
  }
});

router.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};

    const [existing] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    const studentPatch: Record<string, unknown> = { updatedAt: new Date() };

    if ("firstName" in body) {
      const firstName = (body.firstName as string)?.trim();
      if (!firstName) {
        res.status(400).json({ error: "First name is required." });
        return;
      }
      studentPatch.firstName = firstName;
    }
    if ("lastName" in body) studentPatch.lastName = (body.lastName as string)?.trim() ?? "";
    if ("studentId" in body) {
      const newStudentId = (body.studentId as string)?.trim() || null;
      if (newStudentId) {
        const [dup] = await db
          .select({ id: students.id })
          .from(students)
          .where(and(eq(students.studentId, newStudentId), ne(students.id, id)))
          .limit(1);
        if (dup) {
          res.status(409).json({ error: "This Student ID is already in use." });
          return;
        }
      }
      studentPatch.studentId = newStudentId;
    }
    if ("phone" in body) studentPatch.phone = (body.phone as string)?.trim() || null;
    if ("universityId" in body) studentPatch.universityId = (body.universityId as string) || null;
    if ("degreeProgram" in body) studentPatch.degreeProgram = (body.degreeProgram as string)?.trim() || null;
    if ("yearOfStudy" in body) studentPatch.yearOfStudy = (body.yearOfStudy as string)?.trim() || null;
    if ("currentSemesterLabel" in body) studentPatch.currentSemesterLabel = (body.currentSemesterLabel as string)?.trim() || null;
    if ("gpa" in body) studentPatch.gpa = body.gpa != null ? String(body.gpa).trim() || null : null;
    if ("scholarshipType" in body) {
      const parsed = parseOptionalEnum(
        body.scholarshipType,
        SCHOLARSHIP_TYPE_VALUES,
        "scholarship type",
      );
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      studentPatch.scholarshipType = parsed.value;
    }
    if ("graduationYear" in body) {
      const parsed = parseGraduationYear(body.graduationYear);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      studentPatch.graduationYear = parsed.value;
    }
    if ("religion" in body) {
      const parsed = parseOptionalEnum(body.religion, RELIGION_VALUES, "religion");
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      studentPatch.religion = parsed.value;
    }
    if ("ethnicity" in body) {
      const parsed = parseEthnicity(body.ethnicity);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      studentPatch.ethnicity = parsed.value;
    }
    if ("status" in body) {
      const validStatuses = ["ACTIVE", "GRADUATED", "INACTIVE"];
      if (!validStatuses.includes(body.status)) {
        res.status(400).json({ error: "Invalid status." });
        return;
      }
      studentPatch.status = body.status as "ACTIVE" | "GRADUATED" | "INACTIVE";
    }
    if ("photoUrl" in body) studentPatch.photoUrl = (body.photoUrl as string) || null;

    if (Object.keys(studentPatch).length > 1) {
      await db
        .update(students)
        .set(studentPatch as any)
        .where(eq(students.id, id));
    }

    const bankAccountsParsed = parseBankAccountsBody(body);
    if (bankAccountsParsed.provided) {
      if ("error" in bankAccountsParsed) {
        res.status(400).json({ error: bankAccountsParsed.error });
        return;
      }
      const replaced = await replaceStudentBankAccounts(id, bankAccountsParsed.accounts);
      if (!replaced.ok) {
        res.status(400).json({ error: replaced.error });
        return;
      }
    } else {
      const legacyBank = parseLegacyBankFields(body);
      if (legacyBank) {
        await upsertPrimaryBankAccount(id, legacyBank);
      }
    }

    const userPatch: Record<string, unknown> = { updatedAt: new Date() };
    let hasUserPatch = false;

    if ("status" in body) {
      userPatch.isActive = body.status === "ACTIVE";
      hasUserPatch = true;
    }
    if ("email" in body && typeof body.email === "string" && body.email.trim()) {
      const newEmail = body.email.toLowerCase().trim();
      const [dupEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, newEmail), ne(users.id, existing.userId)))
        .limit(1);
      if (dupEmail) {
        res.status(409).json({ error: "An account with this email already exists." });
        return;
      }
      userPatch.email = newEmail;
      hasUserPatch = true;
    }
    if ("password" in body && typeof body.password === "string" && body.password.length >= 8) {
      userPatch.passwordHash = await bcrypt.hash(body.password, 12);
      hasUserPatch = true;
    }

    if (hasUserPatch) {
      await db
        .update(users)
        .set(userPatch as any)
        .where(eq(users.id, existing.userId));
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /students/:id error", err);
    res.status(500).json({ error: "Failed to update student." });
  }
});

router.put("/students/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (!["INACTIVE", "GRADUATED"].includes(status)) {
      res.status(400).json({ error: "Invalid archive status." });
      return;
    }

    const [existing] = await db
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    await db
      .update(students)
      .set({ status: status as "INACTIVE" | "GRADUATED", updatedAt: new Date() } as any)
      .where(eq(students.id, id));

    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() } as any)
      .where(eq(users.id, existing.userId));

    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /students/:id/archive error", err);
    res.status(500).json({ error: "Failed to archive student." });
  }
});

router.patch("/students/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    await db
      .update(students)
      .set({ status: "ACTIVE", updatedAt: new Date() } as any)
      .where(eq(students.id, id));

    await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() } as any)
      .where(eq(users.id, existing.userId));

    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /students/:id/activate error", err);
    res.status(500).json({ error: "Failed to activate student." });
  }
});

export default router;
