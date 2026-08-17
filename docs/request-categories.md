# Payment request categories

## Decision

Keep a single `tuition_payment_requests` table. Category is a column, not a split into four tables. Every category uses the same full submission (payment details + semester report). Duplicate semester reports across categories in the same term are acceptable for v1.

## Schema

`tuition_payment_requests.request_category` (`request_category` pgEnum, `NOT NULL`, default `TUITION`):

| Value | Admin / student label |
|---|---|
| `TUITION` | Tuition |
| `LIVING_EXPENSES` | Living expenses |
| `STUDY_ABROAD_INTERNSHIP` | Study abroad / internship |
| `EMERGENCY_AID` | Emergency aid |

Existing rows backfill as `TUITION`. Indexes:

- `tpr_request_category_idx` — list/export filters
- `tpr_student_category_status_idx` — open-request lookup
- `tpr_student_semester_category_active_idx` — unique `(student_id, semester_label, request_category)` where `status <> REJECTED`

Semester reports stay 1:1 with payment requests via `semester_reports.tuition_payment_request_id`.

## API

`POST /api/submissions` accepts `requestCategory` (one of the four values). Omitted/empty defaults to `TUITION`. Invalid values return `400`.

List and detail (`GET /api/requests`, `GET /api/requests/:id`, `GET /api/students/:id`) return `requestCategory` on each request row. CSV/XLSX export includes a Category column mapped from this field.

## Submission rules

A student may submit **different categories in the same semester**.

Blocked:

1. **Same category + same semester**, unless the previous request of that category was `REJECTED`.
2. **Open request of the same category** (`SUBMITTED` / `UNDER_REVIEW` / `APPROVED`), even if the new request would be for another semester.

Allowed example: tuition submitted for Fall 2026 does not block emergency aid for Fall 2026.

Semester pickers hide a term only when that **chosen category** already has a non-rejected request for it.
