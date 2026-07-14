import { Router, type IRouter } from "express";
import { asc, count, desc, eq, ilike, ne, and, or, type SQL } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  db,
  universities,
  degreePrograms,
  universitySemesters,
  students,
  tuitionPaymentRequests,
} from "@workspace/db";

const router: IRouter = Router();

const UNIVERSITY_SORT_COLUMNS = {
  name: universities.name,
  summer: universities.hasSummerSemester,
  status: universities.isActive,
} as const;

type UniversitySortKey = keyof typeof UNIVERSITY_SORT_COLUMNS;

function parsePagination(req: { query: Record<string, unknown> }) {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String(req.query.limit ?? "20"), 10) || 20),
  );
  return { page, limit, offset: (page - 1) * limit };
}

// ---------------------------------------------------------------------------
// Universities
// ---------------------------------------------------------------------------

router.get("/universities", async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const sortKeyParam = typeof req.query.sortKey === "string" ? req.query.sortKey : "";
    const sortDir = req.query.sortDir === "desc" ? "desc" : "asc";
    const sortKey: UniversitySortKey | null =
      sortKeyParam in UNIVERSITY_SORT_COLUMNS ? (sortKeyParam as UniversitySortKey) : null;

    const conditions: SQL[] = [];
    if (search) {
      const needle = `%${search}%`;
      conditions.push(
        or(
          ilike(universities.name, needle),
          ilike(universities.city, needle),
          ilike(universities.country, needle),
        ) as SQL,
      );
    }
    if (status === "active") conditions.push(eq(universities.isActive, true));
    if (status === "inactive") conditions.push(eq(universities.isActive, false));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const orderColumn = sortKey ? UNIVERSITY_SORT_COLUMNS[sortKey] : universities.name;
    const orderBy =
      sortKey && sortDir === "desc" ? desc(orderColumn) : asc(orderColumn);

    const baseQuery = db.select().from(universities);
    const countQuery = db.select({ value: count() }).from(universities);

    const [unis, [{ value: total }], [{ value: totalCount }], [{ value: activeCount }]] =
      await Promise.all([
        (where ? baseQuery.where(where) : baseQuery)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        where ? countQuery.where(where) : countQuery,
        db.select({ value: count() }).from(universities),
        db.select({ value: count() }).from(universities).where(eq(universities.isActive, true)),
      ]);

    const result = await Promise.all(
      unis.map(async (u) => {
        const [{ value: studentCount }] = await db
          .select({ value: count() })
          .from(students)
          .where(eq(students.universityId, u.id));
        const sems = await db
          .select()
          .from(universitySemesters)
          .where(eq(universitySemesters.universityId, u.id))
          .orderBy(universitySemesters.startDate);
        const progs = await db
          .select()
          .from(degreePrograms)
          .where(eq(degreePrograms.universityId, u.id));

        return {
          ...u,
          _count: { students: Number(studentCount) },
          semesters: sems,
          degreePrograms: progs,
        };
      }),
    );

    res.json({
      items: result,
      total: Number(total),
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(Number(total) / limit)),
      summary: {
        total: Number(totalCount),
        active: Number(activeCount),
      },
    });
  } catch (err) {
    console.error("GET /universities error", err);
    res.status(500).json({ error: "Failed to fetch universities." });
  }
});

router.get("/universities/active", async (_req, res) => {
  try {
    const rows = await db
      .select({ id: universities.id, name: universities.name })
      .from(universities)
      .where(eq(universities.isActive, true))
      .orderBy(universities.name);
    res.json(rows);
  } catch (err) {
    console.error("GET /universities/active error", err);
    res.status(500).json({ error: "Failed to fetch universities." });
  }
});

router.post("/universities", async (req, res) => {
  try {
    const { name, city, country, addressLine, websiteUrl, hasSummerSemester, isActive, notes } =
      req.body ?? {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ error: "University name is required." });
      return;
    }

    const [existing] = await db
      .select({ id: universities.id })
      .from(universities)
      .where(ilike(universities.name, name.trim()))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "A university with this name already exists." });
      return;
    }

    const id = randomUUID();
    const [created] = await db
      .insert(universities)
      .values({
        id,
        name: name.trim(),
        city: city?.trim() || null,
        country: country?.trim() || null,
        addressLine: addressLine?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        hasSummerSemester: Boolean(hasSummerSemester),
        isActive: isActive !== false && isActive !== "false",
        notes: notes?.trim() || null,
      })
      .returning();

    res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A university with this name already exists." });
      return;
    }
    console.error("POST /universities error", err);
    res.status(500).json({ error: "Failed to create university." });
  }
});

router.get("/universities/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [uni] = await db
      .select()
      .from(universities)
      .where(eq(universities.id, id))
      .limit(1);

    if (!uni) {
      res.status(404).json({ error: "University not found." });
      return;
    }

    const sems = await db
      .select()
      .from(universitySemesters)
      .where(eq(universitySemesters.universityId, id))
      .orderBy(universitySemesters.startDate);

    const semsWithCount = await Promise.all(
      sems.map(async (s) => {
        const [{ value: reqCount }] = await db
          .select({ value: count() })
          .from(tuitionPaymentRequests)
          .where(eq(tuitionPaymentRequests.universitySemesterId, s.id));
        return { ...s, _count: { tuitionPaymentRequests: Number(reqCount) } };
      }),
    );

    const progs = await db
      .select()
      .from(degreePrograms)
      .where(eq(degreePrograms.universityId, id));

    const studs = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        studentId: students.studentId,
        status: students.status,
        degreeProgram: students.degreeProgram,
      })
      .from(students)
      .where(eq(students.universityId, id))
      .limit(5);

    const allPrograms = await db
      .select({ degreeProgram: students.degreeProgram })
      .from(students)
      .where(eq(students.universityId, id));

    const [{ value: studentCount }] = await db
      .select({ value: count() })
      .from(students)
      .where(eq(students.universityId, id));

    const assignedDegreePrograms = [
      ...new Set(
        allPrograms
          .map((s) => s.degreeProgram?.toLowerCase())
          .filter((p): p is string => Boolean(p)),
      ),
    ];

    res.json({
      ...uni,
      semesters: semsWithCount,
      degreePrograms: progs,
      students: studs,
      _count: { students: Number(studentCount) },
      assignedDegreePrograms,
    });
  } catch (err) {
    console.error("GET /universities/:id error", err);
    res.status(500).json({ error: "Failed to fetch university." });
  }
});

router.put("/universities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      city,
      country,
      addressLine,
      websiteUrl,
      hasSummerSemester,
      isActive,
      notes,
      imageUrl,
    } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ error: "University name is required." });
      return;
    }

    const [updated] = await db
      .update(universities)
      .set({
        name: name.trim(),
        city: city?.trim() || null,
        country: country?.trim() || null,
        addressLine: addressLine?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        hasSummerSemester: Boolean(hasSummerSemester),
        isActive: isActive !== false && isActive !== "false",
        notes: notes?.trim() || null,
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(universities.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "University not found." });
      return;
    }

    res.json(updated);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A university with this name already exists." });
      return;
    }
    console.error("PUT /universities/:id error", err);
    res.status(500).json({ error: "Failed to update university." });
  }
});

router.patch("/universities/:id/active", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body ?? {};

    const [updated] = await db
      .update(universities)
      .set({ isActive: Boolean(isActive), updatedAt: new Date() })
      .where(eq(universities.id, id))
      .returning({ id: universities.id });

    if (!updated) {
      res.status(404).json({ error: "University not found." });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /universities/:id/active error", err);
    res.status(500).json({ error: "Failed to update university." });
  }
});

router.post("/universities/:id/image", async (req, res) => {
  try {
    const { id } = req.params;
    const { imageDataUrl } = req.body ?? {};

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      res.status(400).json({ error: "imageDataUrl is required." });
      return;
    }

    if (!imageDataUrl.startsWith("data:image/")) {
      res.status(400).json({ error: "imageDataUrl must be a valid image data URL." });
      return;
    }

    const [updated] = await db
      .update(universities)
      .set({ imageUrl: imageDataUrl, updatedAt: new Date() })
      .where(eq(universities.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "University not found." });
      return;
    }

    res.json({ imageUrl: updated.imageUrl });
  } catch (err) {
    console.error("POST /universities/:id/image error", err);
    res.status(500).json({ error: "Failed to update image." });
  }
});

// ---------------------------------------------------------------------------
// Semesters
// ---------------------------------------------------------------------------

router.get("/universities/:id/semesters", async (req, res) => {
  try {
    const { id } = req.params;
    const activeOnly = req.query.activeOnly !== "false";

    const rows = await db
      .select()
      .from(universitySemesters)
      .where(
        activeOnly
          ? and(
              eq(universitySemesters.universityId, id),
              eq(universitySemesters.isActive, true),
            )
          : eq(universitySemesters.universityId, id),
      )
      .orderBy(universitySemesters.startDate);

    res.json(rows);
  } catch (err) {
    console.error("GET /universities/:id/semesters error", err);
    res.status(500).json({ error: "Failed to fetch semesters." });
  }
});

router.post("/universities/:id/semesters", async (req, res) => {
  try {
    const { id: universityId } = req.params;
    const { academicYear, termCode, label, startDate, endDate, isActive } = req.body ?? {};

    if (!academicYear || !termCode || !label || !startDate || !endDate) {
      res.status(400).json({ error: "All semester fields are required." });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      res.status(400).json({ error: "Invalid date format." });
      return;
    }
    if (end < start) {
      res.status(400).json({ error: "End date must be after start date." });
      return;
    }

    const [sem] = await db
      .insert(universitySemesters)
      .values({
        id: randomUUID(),
        universityId,
        academicYear,
        termCode,
        label,
        startDate: start,
        endDate: end,
        isActive: isActive !== false && isActive !== "false",
      })
      .returning();

    res.status(201).json(sem);
  } catch (err) {
    console.error("POST /universities/:id/semesters error", err);
    res.status(500).json({ error: "Failed to create semester." });
  }
});

router.put("/universities/:id/semesters/:semId", async (req, res) => {
  try {
    const { semId } = req.params;
    const { academicYear, termCode, label, startDate, endDate, isActive } = req.body ?? {};

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      res.status(400).json({ error: "Invalid date format." });
      return;
    }
    if (end < start) {
      res.status(400).json({ error: "End date must be after start date." });
      return;
    }

    const [updated] = await db
      .update(universitySemesters)
      .set({
        academicYear,
        termCode,
        label,
        startDate: start,
        endDate: end,
        isActive: Boolean(isActive),
        updatedAt: new Date(),
      })
      .where(eq(universitySemesters.id, semId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Semester not found." });
      return;
    }

    res.json(updated);
  } catch (err) {
    console.error("PUT /universities/:id/semesters/:semId error", err);
    res.status(500).json({ error: "Failed to update semester." });
  }
});

router.patch("/universities/:id/semesters/:semId/active", async (req, res) => {
  try {
    const { semId } = req.params;
    const { isActive } = req.body ?? {};

    const [updated] = await db
      .update(universitySemesters)
      .set({ isActive: Boolean(isActive), updatedAt: new Date() })
      .where(eq(universitySemesters.id, semId))
      .returning({ id: universitySemesters.id });

    if (!updated) {
      res.status(404).json({ error: "Semester not found." });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /universities/:id/semesters/:semId/active error", err);
    res.status(500).json({ error: "Failed to update semester." });
  }
});

router.delete("/universities/:id/semesters/:semId", async (req, res) => {
  try {
    const { semId } = req.params;

    const [{ value: linked }] = await db
      .select({ value: count() })
      .from(tuitionPaymentRequests)
      .where(eq(tuitionPaymentRequests.universitySemesterId, semId));

    if (Number(linked) > 0) {
      res.status(409).json({
        error: "Cannot delete a semester linked to submissions. Deactivate it instead.",
      });
      return;
    }

    await db.delete(universitySemesters).where(eq(universitySemesters.id, semId));
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /universities/:id/semesters/:semId error", err);
    res.status(500).json({ error: "Failed to delete semester." });
  }
});

// ---------------------------------------------------------------------------
// Degree Programs
// ---------------------------------------------------------------------------

router.post("/universities/:id/programs", async (req, res) => {
  try {
    const { id: universityId } = req.params;
    const { name, isActive } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ error: "Program name must be at least 2 characters." });
      return;
    }

    const [dup] = await db
      .select({ id: degreePrograms.id })
      .from(degreePrograms)
      .where(and(eq(degreePrograms.universityId, universityId), ilike(degreePrograms.name, name.trim())))
      .limit(1);

    if (dup) {
      res.status(409).json({ error: "A program with this name already exists at this university." });
      return;
    }

    const [created] = await db
      .insert(degreePrograms)
      .values({
        id: randomUUID(),
        universityId,
        name: name.trim(),
        isActive: isActive !== false && isActive !== "false",
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    console.error("POST /universities/:id/programs error", err);
    res.status(500).json({ error: "Failed to create degree program." });
  }
});

router.put("/universities/:id/programs/:progId", async (req, res) => {
  try {
    const { id: universityId, progId } = req.params;
    const { name, isActive } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ error: "Program name must be at least 2 characters." });
      return;
    }

    const [dup] = await db
      .select({ id: degreePrograms.id })
      .from(degreePrograms)
      .where(
        and(
          eq(degreePrograms.universityId, universityId),
          ilike(degreePrograms.name, name.trim()),
          ne(degreePrograms.id, progId),
        ),
      )
      .limit(1);

    if (dup) {
      res.status(409).json({ error: "A program with this name already exists at this university." });
      return;
    }

    const [updated] = await db
      .update(degreePrograms)
      .set({ name: name.trim(), isActive: Boolean(isActive), updatedAt: new Date() })
      .where(eq(degreePrograms.id, progId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Degree program not found." });
      return;
    }

    res.json(updated);
  } catch (err) {
    console.error("PUT /universities/:id/programs/:progId error", err);
    res.status(500).json({ error: "Failed to update degree program." });
  }
});

router.patch("/universities/:id/programs/:progId/active", async (req, res) => {
  try {
    const { progId } = req.params;
    const { isActive } = req.body ?? {};

    const [updated] = await db
      .update(degreePrograms)
      .set({ isActive: Boolean(isActive), updatedAt: new Date() })
      .where(eq(degreePrograms.id, progId))
      .returning({ id: degreePrograms.id });

    if (!updated) {
      res.status(404).json({ error: "Degree program not found." });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /universities/:id/programs/:progId/active error", err);
    res.status(500).json({ error: "Failed to update degree program." });
  }
});

router.delete("/universities/:id/programs/:progId", async (req, res) => {
  try {
    const { id: universityId, progId } = req.params;

    const [prog] = await db
      .select({ name: degreePrograms.name })
      .from(degreePrograms)
      .where(eq(degreePrograms.id, progId))
      .limit(1);

    if (!prog) {
      res.json({ ok: true });
      return;
    }

    const [{ value: linked }] = await db
      .select({ value: count() })
      .from(students)
      .where(and(eq(students.universityId, universityId), ilike(students.degreeProgram, prog.name)));

    if (Number(linked) > 0) {
      res.status(409).json({
        error: "Cannot delete a program assigned to students. Deactivate it instead.",
      });
      return;
    }

    await db.delete(degreePrograms).where(eq(degreePrograms.id, progId));
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /universities/:id/programs/:progId error", err);
    res.status(500).json({ error: "Failed to delete degree program." });
  }
});

export default router;
