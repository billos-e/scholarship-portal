# Student profile fields (scholarship type, graduation year, religion, ethnicity)

## Decision

These fields live on `students` as optional profile data. They are **not** required to start a submission. Scholarship type is the student’s overall award; it is independent of `tuition_payment_requests.request_category`.

## Schema

All columns nullable. Existing rows stay valid.

| Column | Type | Values / notes |
|---|---|---|
| `scholarship_type` | `scholarship_type` pgEnum | `TUITION`, `LIVING_EXPENSES`, `FULL_SCHOLARSHIP` |
| `graduation_year` | `integer` | Expected calendar year (e.g. 2027). `year_of_study` is unchanged. |
| `religion` | `religion` pgEnum | `CHRISTIAN`, `BUDDHIST`, `ANIMIST`, `NONE` |
| `ethnicity` | `text[]` | Multi-select from the portal ethnicity list. A previous single string is migrated to a one-element array. |

Migration: `lib/db/migrations/0003_add_student_profile_fields.sql`.

## API

`GET /api/students` and `GET /api/students/:id` return the four fields on each student row (`scholarshipType`, `graduationYear`, `religion`, `ethnicity`).

`POST /api/students` and `PUT /api/students/:id` accept them as optional body fields:

- Empty / omitted on create → `NULL`
- Empty string or empty array on update → `NULL`
- Invalid enum or non-integer year → `400`

`ethnicity` accepts a string array (or a comma/semicolon-separated string). Unknown labels are stored as given so migrated custom values are not dropped.

## Frontend

Student and admin **edit** pages write the fields; **detail** pages show them (empty → "—"). Ethnicity uses chip multi-select. Admin student export includes the four columns. Create-student dialog stays minimal (email + university) and does not collect these fields.
