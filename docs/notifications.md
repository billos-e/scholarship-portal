# Admin email notifications

Automatic emails to **all active ADMIN users** in the local `users` table (`role = ADMIN` and `is_active = true`). Recipients are **not** taken from an env var list. Admin Settings still uses DB ∩ Clerk for the UI; background jobs use the DB list so they work without a Clerk round-trip.

There is no in-app notification UI in v1 — email only.

## Environment

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `RESEND_API_KEY` | For sending | — | Resend API key. If missing, the server logs a warning and **skips** the send. Student submit still succeeds. |
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

A single submit can send both GPA and emergency-aid emails (different kinds). Email failure never rolls back the submission. `POST /api/submissions` calls `notifyAdminsAfterSubmission` after the request and semester report rows are saved.

## Schema

Table `admin_notification_log`:

| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | UUID |
| `tuition_payment_request_id` | `text` FK → `tuition_payment_requests` `ON DELETE CASCADE` | |
| `kind` | `admin_notification_kind` | See table above |
| `sent_at` | `timestamptz` | Set when the send is claimed |

Unique `(tuition_payment_request_id, kind)` so a cron tick cannot spam. Index `tpr_due_date_idx` on `tuition_payment_requests.due_date` supports the scan.

The job **inserts the log row first**, then sends. If Resend fails, the row is deleted so the next run can retry. A successful send is never repeated.

Migration: `lib/db/migrations/0007_add_admin_notification_log.sql`.

```bash
pnpm --filter @workspace/db run migrate
```

## Deadline job

There is no in-process scheduler. Call this endpoint on a schedule (daily is enough; more often is safe because of the unique log).

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
