import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAdmin, type AdminRequest } from "../lib/require-admin";
import {
  dismissForAdmin,
  listUnreadForAdmin,
  UNREAD_NOTIFICATION_LIMIT,
} from "../lib/in-app-notifications";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const idParamSchema = z.string().min(1).max(128);

/**
 * GET /api/admin/notifications
 * Unread in-app alerts for the current admin. Newest first. Limit 50.
 */
router.get("/admin/notifications", requireAdmin, async (req, res) => {
  const admin = (req as AdminRequest).admin;
  try {
    const notifications = await listUnreadForAdmin(admin.id, UNREAD_NOTIFICATION_LIMIT);
    res.json({ notifications });
  } catch (err) {
    logger.error({ err }, "GET /admin/notifications failed");
    res.status(500).json({ error: "Failed to load notifications." });
  }
});

/**
 * POST /api/admin/notifications/:id/dismiss
 * Dismisses one log row for this admin only. Idempotent if already dismissed.
 */
router.post("/admin/notifications/:id/dismiss", requireAdmin, async (req, res) => {
  const admin = (req as AdminRequest).admin;
  const parsed = idParamSchema.safeParse(req.params.id);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid notification id." });
    return;
  }

  try {
    const result = await dismissForAdmin(admin.id, parsed.data);
    if (result === "not_found") {
      res.status(404).json({ error: "Notification not found." });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err, id: parsed.data }, "POST /admin/notifications/:id/dismiss failed");
    res.status(500).json({ error: "Could not dismiss notification." });
  }
});

export default router;
