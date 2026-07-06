import { Router, type IRouter } from "express";
import { count, eq } from "drizzle-orm";
import {
  db,
  universities,
  degreePrograms,
  universitySemesters,
  students,
  tuitionPaymentRequests,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/universities", async (_req, res) => {
  try {
    const unis = await db.select().from(universities).orderBy(universities.name);

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

    res.json(result);
  } catch (err) {
    console.error("GET /universities error", err);
    res.status(500).json({ error: "Failed to fetch universities." });
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
    const { name, city, country, addressLine, websiteUrl, hasSummerSemester, isActive, notes } =
      req.body ?? {};

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

export default router;
