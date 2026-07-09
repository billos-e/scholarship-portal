import { Router, type IRouter } from "express";
import { asc, desc, eq } from "drizzle-orm";
import {
  db,
  universitySemesters,
  degreePrograms,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/semesters/active", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: universitySemesters.id,
        label: universitySemesters.label,
        academicYear: universitySemesters.academicYear,
        universityId: universitySemesters.universityId,
      })
      .from(universitySemesters)
      .where(eq(universitySemesters.isActive, true))
      .orderBy(desc(universitySemesters.startDate));
    res.json(rows);
  } catch (err) {
    console.error("GET /semesters/active error", err);
    res.status(500).json({ error: "Failed to fetch semesters." });
  }
});

router.get("/academic-options", async (_req, res) => {
  try {
    const [semesters, catalogPrograms] = await Promise.all([
      db
        .select({
          id: universitySemesters.id,
          universityId: universitySemesters.universityId,
          label: universitySemesters.label,
          academicYear: universitySemesters.academicYear,
          startDate: universitySemesters.startDate,
          endDate: universitySemesters.endDate,
        })
        .from(universitySemesters)
        .where(eq(universitySemesters.isActive, true))
        .orderBy(desc(universitySemesters.startDate)),
      db
        .select({
          universityId: degreePrograms.universityId,
          name: degreePrograms.name,
        })
        .from(degreePrograms)
        .where(eq(degreePrograms.isActive, true))
        .orderBy(asc(degreePrograms.name)),
    ]);

    const toDay = (d: Date) => new Date(d).toISOString().slice(0, 10);

    const semestersByUniversity: Record<
      string,
      { id: string; label: string; academicYear: string; startDate: string; endDate: string }[]
    > = {};
    for (const s of semesters) {
      const list = semestersByUniversity[s.universityId] ?? [];
      list.push({
        id: s.id,
        label: s.label,
        academicYear: s.academicYear,
        startDate: toDay(s.startDate),
        endDate: toDay(s.endDate),
      });
      semestersByUniversity[s.universityId] = list;
    }

    // Programs are scoped strictly to each university's own active catalog
    // entries. Student-held free-text values are intentionally excluded here
    // so a typo/legacy value on one student never becomes a selectable
    // option for every other student at that university.
    const programSets: Record<string, Set<string>> = {};
    for (const row of catalogPrograms) {
      if (!row.universityId || !row.name) continue;
      const set = programSets[row.universityId] ?? new Set<string>();
      set.add(row.name);
      programSets[row.universityId] = set;
    }

    const programsByUniversity: Record<string, string[]> = {};
    for (const [universityId, set] of Object.entries(programSets)) {
      programsByUniversity[universityId] = [...set].sort((a, b) => a.localeCompare(b));
    }

    res.json({ semestersByUniversity, programsByUniversity });
  } catch (err) {
    console.error("GET /academic-options error", err);
    res.status(500).json({ error: "Failed to fetch academic options." });
  }
});

export default router;
