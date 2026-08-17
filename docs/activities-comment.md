# Activities comment on semester reports

## Decision

Activities stay on `semester_reports.activities` (`text[]`). They are collected on the **Reflections** step (not Wellbeing) for every payment category. `activities_comment` is optional free text so the student can qualify those selections. It is distinct from the three reflection fields.

Existing columns, including `activities` and `challenges`, are unchanged. Challenges remain on the Wellbeing step.

## Schema

| Column | Type | Notes |
|---|---|---|
| `activities_comment` | `text` | Optional. Nullable so existing rows stay valid. |

Migration: `lib/db/migrations/0005_add_activities_comment.sql`.

## API

`POST /api/submissions` accepts `activitiesComment` — trimmed string or omitted (`null`). Same payload for all request categories.

`GET /api/requests/:id` returns `activitiesComment` on `semesterReport`.

## Frontend

Student submit **Reflections** step (step 5): activity chips, then optional comment, then the three reflection questions. Wellbeing (step 4) keeps ratings and challenges only. Student history and admin request detail show activities and the comment under Reflections; challenges stay with wellbeing/context.
