# Reflection questions and Semester Report step

## Decision

Keep the original reflection columns on `semester_reports` (`reflection_achievement`, `reflection_challenge`, `reflection_additional`). Production rows already have answers there. New submissions write **only** the three current prompts. Detail views fall back to the old columns when a new field is empty so historical reports still read.

Academic, wellbeing, activities, and reflections are one **Semester Report** wizard step (not three). Payment stays its own step; the step label is “Payment” so living / emergency / study-abroad requests are not titled “Tuition”.

## Schema

All new columns are nullable. Existing rows stay valid. Old columns are unchanged.

| Column | Type | Prompt |
|---|---|---|
| `reflection_overcome_challenge` | `text` | Tell us about a significant challenge for you this semester and how you overcame it? |
| `reflection_meaningful_experience` | `text` | What has been the most meaningful experience of your semester? |
| `reflection_proud_achievement` | `text` | What do you feel most proud of achieving this semester and why? |

**Kept (do not drop):** `reflection_achievement`, `reflection_challenge`, `reflection_additional`.

Fallback when displaying a report:

| New field | Historical fallback |
|---|---|
| `reflection_overcome_challenge` | `reflection_challenge` |
| `reflection_meaningful_experience` | `reflection_additional` |
| `reflection_proud_achievement` | `reflection_achievement` |

Migration: `lib/db/migrations/0006_add_new_reflection_questions.sql`.

## API

`POST /api/submissions` accepts:

- `reflectionOvercomeChallenge`
- `reflectionMeaningfulExperience`
- `reflectionProudAchievement`

Trimmed string or omitted (`null`). The three legacy fields are not written on new inserts.

`GET /api/requests/:id` returns both the new and legacy fields on `semesterReport`.

## Wizard steps

1. **Semester** — term picker (unchanged).
2. **Payment** — amount, due date, invoice, screenshot, message. Header uses the selected category label (Tuition, Living expenses, Study abroad / internship, Emergency aid).
3. **Semester Report** — one scrollable step with subheadings:
   - Academic report (GPA, credits, withdraw, comment, transcript, awards)
   - Wellbeing (ratings + challenges)
   - Activities (chips + comment)
   - Reflections (the three new questions)

Awards, activities, and `activities_comment` stay on this step. Payment categories and student profile fields are unchanged.
