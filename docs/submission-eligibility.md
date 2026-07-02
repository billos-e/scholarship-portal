# Submission eligibility rules

> Business rules enforced when a student starts or submits a semester payment request.  
> Last updated: 2026-07-02

## Overview

Students may only start **New Submission** when their profile is complete and they have no active payment request in the pipeline. At submit time, duplicate semester submissions are also blocked.

Enforcement happens in:

- `src/lib/submissions/eligibility.ts` — shared checks
- `src/lib/actions/submissions.ts` — server action (authoritative)
- `src/app/student/submit/page.tsx` — blocked UI when not eligible
- Dashboard / history entry points — contextual CTAs

## 1. Profile must be complete

Before opening the submission form, the student profile must include:

| Area | Required fields |
|------|-----------------|
| Personal | First name, last name (always set), **Student ID** |
| Academic | University, degree program, year of study, current semester, GPA |
| Bank | Account holder, account number, bank name |

**Optional** (per contract): PromptPay number, QR payment image, phone, profile photo.

If any required field is missing, `/student/submit` shows a blocked state with a link to **Edit profile**.

## 2. No active (non-terminal) request

A student cannot start a new submission while they have **any** request whose status is:

- `SUBMITTED`
- `UNDER_REVIEW`
- `APPROVED`

They **may** start again once every prior request is either:

- `PAID`, or
- `REJECTED`

This is a **global** rule (one pipeline at a time), not per semester.

## 3. One submission per university semester

A student cannot submit twice for the same **university semester** (year + term + university), unless the previous request for that semester was `REJECTED`.

Matching uses `university_semester_id` when present; legacy rows fall back to `semester_label`.

## Resubmit after rejection

When admin marks a request `REJECTED`:

1. Rule 2 allows a new submission (no other active requests).
2. Rule 3 allows resubmitting the **same** semester (rejected rows are excluded from the duplicate check).

## Database constraint

Partial unique index on `(student_id, university_semester_id)` where `status != REJECTED` — see migration `20260702140000_submission_eligibility_constraints`.

Race-safe duplicate protection at the DB layer; application checks provide user-facing errors.

## Related docs

- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — workflows §5
- [`PHASE2_SCOPE.md`](./PHASE2_SCOPE.md) — `UniversitySemesters` selection
