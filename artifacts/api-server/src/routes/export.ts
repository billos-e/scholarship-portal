import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, users } from "@workspace/db";
import { buildCsvZipBuffer, buildXlsxBuffer, type ExportSheet } from "../lib/export";

const router: IRouter = Router();

/**
 * Requires the caller to identify an active ADMIN user via the `X-Admin-Id`
 * header. This app's custom (non-Clerk) session lives in the client's
 * localStorage rather than a server cookie, so admin-only server routes
 * verify the claimed identity against the database on every request.
 */
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminId = req.header("x-admin-id");
  if (!adminId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, adminId)).limit(1);
  if (!user || !user.isActive) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  if (user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required." });
    return;
  }

  next();
}

const exportCellSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

const exportSheetSchema = z.object({
  name: z.string().min(1).max(31),
  columns: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(1),
  rows: z.array(z.record(z.string(), exportCellSchema)),
  csvFilenameSuffix: z.string().optional(),
});

const exportBodySchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-zA-Z0-9._-]+$/),
  sheets: z.array(exportSheetSchema).min(1).max(10),
});

router.post("/export/csv-zip", requireAdmin, async (req, res) => {
  const parsed = exportBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid export payload" });
    return;
  }

  try {
    const buffer = await buildCsvZipBuffer(parsed.data.sheets as ExportSheet[]);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${parsed.data.filename}.zip"`,
    );
    res.setHeader("Cache-Control", "no-store");
    res.send(buffer);
  } catch (err) {
    req.log.error({ err }, "CSV zip export failed");
    res.status(500).json({ error: "CSV export failed. Please try again." });
  }
});

router.post("/export/xlsx", requireAdmin, (req, res) => {
  const parsed = exportBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid export payload" });
    return;
  }

  try {
    const buffer = buildXlsxBuffer(parsed.data.sheets as ExportSheet[]);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${parsed.data.filename}.xlsx"`,
    );
    res.setHeader("Cache-Control", "no-store");
    res.send(buffer);
  } catch (err) {
    req.log.error({ err }, "XLSX export failed");
    res.status(500).json({ error: "Excel export failed. Please try again." });
  }
});

export default router;
