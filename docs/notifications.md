# Admin notifications (email + in-app tray)

Automatic alerts to **all active ADMIN users** in the local `users` table (`role = ADMIN` and `is_active = true`). Recipients are **not** taken from an env var list. Admin Settings still uses DB ∩ Clerk for the UI; background jobs use the DB list so they work without a Clerk round-trip.

Admins get **email** (Resend) and an **in-app tray** on admin pages. Students never see the tray. Email and in-app share the same event log; dismissing in-app does not cancel email, and missing `RESEND_API_KEY` still logs a warning and skips email while the tray still shows the event.

## Environment

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `RESEND_API_KEY` | For sending | — | Resend API key. If missing, the server logs a warning and **skips** the send. Student submit still succeeds. The in-app log row is still inserted. |
| `RESEND_FROM_EMAIL` | Recommended in production | `Scholarship Portal <beth.t@example.com>` | From-address. Resend’s test domain works until a real domain is verified. Production should use a verified domain (`Name <mail@yourdomain>`). |
| `CRON_SECRET` | For the deadline job | — | Shared secret. The deadline endpoint returns `503` if unset, `401` if the header does not match. |
| `DEADLINE_NOTICE_DAYS` | Optional | `7` | How many calendar days before `due_date` to send the approaching alert. |
| `PUBLIC_APP_URL` | Optional | — | Origin of the portal (no trailing slash). When set, emails include a link to `/admin/requests/:id`. |

Do not commit secrets. Sending may fail until the client’s Resend domain is verified — that is expected.

## Triggers

| Kind (`admin_notification_kind`) | When | Timing |
|---|---|---|
| `GPA_UNDER_3` | Semester report GPA is **strictly below 3.0** (report GPA, not the student profile field). Missing/invalid GPA does not notify. | Immediately after `POST /api/submissions` succeeds |
| `EMERGENCY_AID` | Payment request `request_category = EMERGENCY_AID` | Immediately after submit |
| `DEADLINE_APPROACHING` | Open request (`SUBMITTED` / `UNDER_REVIEW` / `APPROVED`) with a `due_date` from **today through N days** (default 7) | Cron / internal endpoint |
| `DEADLINE_OVERDUE` | Same open statuses, `due_date` already passed, not `PAID` or `REJECTED` | Cron / internal endpoint |

A single submit can create both GPA and emergency-aid events (different kinds). Email failure never rolls back the submission. `POST /api/submissions` calls `notifyAdminsAfterSubmission` after the request and semester report rows are saved. GPA and emergency-aid **do not** wait for cron.

## Schema

### Event source — `admin_notification_log`

One row per `(tuition_payment_request_id, kind)` when the event fires. Used for email dedupe **and** as the in-app event source. Do not treat this uniqueness as “this admin has read it.”

| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | UUID |
| `tuition_payment_request_id` | `text` FK → `tuition_payment_requests` `ON DELETE CASCADE` | |
| `kind` | `admin_notification_kind` | See table above |
| `sent_at` | `timestamptz` | When the event was logged (insert-first), not necessarily when email succeeded |

Unique `(tuition_payment_request_id, kind)` so a cron tick cannot spam. Index `tpr_due_date_idx` on `tuition_payment_requests.due_date` supports the scan. Index on `sent_at` supports newest-first tray queries.

The job **inserts the log row first**, then sends email. If Resend is missing or fails, the row is **kept** so the in-app tray still appears. A successful send is never repeated (same unique key). That means a failed deadline email is not retried on the next cron tick; the in-app row remains.

Migrations: `lib/db/migrations/0007_add_admin_notification_log.sql`, `lib/db/migrations/0009_add_admin_notification_dismissals.sql`.

### Per-admin dismiss — `admin_notification_dismissals`

| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | UUID |
| `user_id` | `text` FK → `users` `ON DELETE CASCADE` | The admin who clicked |
| `admin_notification_log_id` | `text` FK → `admin_notification_log` `ON DELETE CASCADE` | |
| `dismissed_at` | `timestamptz` | When this admin dismissed |

Unique `(user_id, admin_notification_log_id)`. Unread for admin A = log rows with no dismissal for A. Clicking dismisses for that admin only.

```bash
pnpm --filter @workspace/db run migrate
```

## In-app API

Admin-only. Identify the caller with `X-Admin-Id` (portal session user id) or a Clerk session. Students receive 401/403.

```http
GET /api/admin/notifications
X-Admin-Id: <users.id>
```

Newest unread first. Limit 50.

```json
{
  "notifications": [
    {
      "id": "log-uuid",
      "kind": "GPA_UNDER_3",
      "title": "GPA under 3.0",
      "studentName": "Jane Doe",
      "studentCode": "S123",
      "semesterLabel": "Fall 2026",
      "requestId": "request-uuid",
      "createdAt": "2026-08-18T11:00:00.000Z"
    }
  ]
}
```

```http
POST /api/admin/notifications/:id/dismiss
X-Admin-Id: <users.id>
```

`:id` is the **log** id. 404 if the log row does not exist. Idempotent if this admin already dismissed it (`{ ok: true }`). Other admins still see the item.

The admin shell mounts a floating tray (`AdminNotificationTray` in `AppShell` when `variant="admin"`). Hidden entirely when unread is empty. Clicking a row dismisses then navigates to `/admin/requests/:id`. Polls about every 45s and on window focus.

## Deadline job

There is no in-process scheduler. Call this endpoint on a schedule (daily is enough; more often is safe because of the unique log). GPA / emergency-aid do **not** use this job.

```http
POST /api/internal/run-deadline-notifications
X-Cron-Secret: <CRON_SECRET>
```

`Authorization: Bearer <CRON_SECRET>` is also accepted.

Example:

```bash
curl -sS -X POST "$PUBLIC_APP_URL/api/internal/run-deadline-notifications" \
  -H "X-Cron-Secret: $CRON_SECRET"
```

Successful JSON: `{ ok, checked, sent, skipped, failed, noticeDays }`.

### Replit

1. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, and optionally `PUBLIC_APP_URL` / `DEADLINE_NOTICE_DAYS` in Secrets.
2. Run the migration.
3. Add a **Scheduled deployment** / cron job that `POST`s the path above once per day (e.g. 08:00). Use the published app URL, not a temporary dev URL.

External cron (GitHub Actions, systemd, crontab) can hit the same endpoint.

## Email body

Plain professional HTML + text. Includes student name, student ID when present, semester, category, request id, GPA or due date as relevant, and the admin request URL when `PUBLIC_APP_URL` is set.
