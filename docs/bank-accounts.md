# Student bank accounts (up to 2)

## Decision

Keep `bank_information` as the account table. It was 1:1 with students (`student_id` UNIQUE). That unique constraint is dropped so a student can have **at most two** rows. Existing columns are unchanged; existing rows migrate as account 1 (`sort_order = 1`).

A separate `student_bank_accounts` table was not added: payment requests already snapshot the same field names, import/export already use those columns, and migrating in place avoids dropping data.

`tuition_payment_requests` snapshot columns (`bank_account_name`, `bank_account_number`, `bank_name`, `promptpay_number`, `qr_payment_image_url`) are unchanged. Each submission copies one account onto the request.

## Schema

| Column | Notes |
|---|---|
| `id` | Primary key (unchanged) |
| `student_id` | FK to `students`, **no longer unique** |
| `sort_order` | `1` = primary / first, `2` = second |
| `bank_account_name`, `bank_account_number`, `bank_name`, `promptpay_number`, `qr_payment_image_url` | Unchanged |

Constraints:

- `UNIQUE (student_id, sort_order)`
- `CHECK (sort_order IN (1, 2))` — database-level max of 2
- Index on `student_id` for list/detail lookups

API and app also reject more than 2 accounts.

Migration: `lib/db/migrations/0008_allow_two_bank_accounts.sql`. Drizzle schema: `bankInformation.sortOrder` with unique `(student_id, sort_order)` — not unique `student_id`.

## API

`GET /api/students` and `GET /api/students/:id` return:

- `bankAccounts`: array of accounts sorted by `sort_order` (0–2 items)
- `bankInformation`: the primary account (`sort_order = 1`, else first), or `null` — kept for older callers

`PUT /api/students/:id`:

- `bankAccounts`: optional array (max 2). Replaces the student’s accounts. Empty objects are omitted. Removing the second item deletes that row.
- Legacy flat fields (`bankAccountName`, `bankAccountNumber`, `bankName`, `promptpayNumber`) still update **account 1 only** and leave account 2 alone.

`POST /api/students` still creates an empty account 1.

`POST /api/submissions` snapshots one account onto the request via `resolveSubmissionBankSnapshot`. Optional `bankAccountId` selects which account; otherwise the primary (or first) is used. Submitted bank fields remain as a fallback. After insert, GPA < 3.0 and emergency-aid emails go to active admins (see `docs/notifications.md`).

## Eligibility

A profile is complete for submission when **at least one** account has bank name, account holder, and account number. PromptPay is optional.

## Import / export

Existing single-account columns stay account 1:

`bank_account_name`, `bank_account_number`, `bank_name`, `promptpay_number`

Account 2 uses optional `*_2` columns:

`bank_account_name_2`, `bank_account_number_2`, `bank_name_2`, `promptpay_number_2`
