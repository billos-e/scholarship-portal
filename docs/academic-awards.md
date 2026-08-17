# Academic awards on semester reports

## Decision

Awards live on `semester_reports` next to GPA, transcript, and `academic_comment`. They are **not** a separate table. The two award types are independent booleans (neither / one / both). Supporting files are optional, matching transcript. `awards_comment` is distinct from `academic_comment` (performance vs awards).

Existing columns are unchanged.

## Schema

All columns nullable. Existing rows stay valid.

| Column | Type | Notes |
|---|---|---|
| `received_academic_excellence_award` | `boolean` | Yes / No / unset |
| `received_other_award` | `boolean` | Yes / No / unset |
| `award_file_urls` | `text[]` | Zero or more PDF/JPG/PNG URLs from the same upload flow as transcript |
| `awards_comment` | `text` | Optional student note about awards |

Migration: `lib/db/migrations/0004_add_academic_awards.sql`.

## API

`POST /api/submissions` accepts:

- `receivedAcademicExcellenceAward` / `receivedOtherAward` — boolean, `"true"` / `"false"`, or omitted (`null`)
- `awardFileUrls` — string array (empty / omitted → `null`; a single string is wrapped)
- `awardsComment` — trimmed string or omitted (`null`)

`GET /api/requests/:id` returns the four fields on `semesterReport`.

## Frontend

Student submit **Semester Report** step (step 3), Academic report subsection: two Yes/No toggles, multi-file upload (`awardFiles`), awards comment. Student history and admin request detail show Yes/No, comment if present, and preview/download links for each file.
