import { timingSafeEqual } from "crypto";
import { Router, type IRouter } from "express";
import { runDeadlineNotifications } from "../lib/deadline-notifications";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function cronSecretMatches(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * POST /api/internal/run-deadline-notifications
 * Header: X-Cron-Secret: <CRON_SECRET>
 *
 * Scans open payment requests with a due date and emails active admins
 * for approaching (default 7 days) and overdue items. Deduped via
 * admin_notification_log.
 */
router.post("/internal/run-deadline-notifications", async (req, res) => {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) {
    res.status(503).json({ error: "CRON_SECRET is not configured." });
    return;
  }

  const provided =
    (typeof req.headers["x-cron-secret"] === "string"
      ? req.headers["x-cron-secret"]
      : undefined) ??
    (typeof req.headers.authorization === "string" &&
    req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.slice("Bearer ".length)
      : undefined);

  if (!cronSecretMatches(provided, expected)) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  try {
    const result = await runDeadlineNotifications();
    res.json({ ok: true, ...result });
  } catch (err) {
    logger.error({ err }, "Deadline notification job failed");
    res.status(500).json({ error: "Deadline notification job failed." });
  }
});

export default router;
