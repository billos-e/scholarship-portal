---
name: Scholarship portal server-side pagination
description: Pagination/sort/filter contract for admin Students & Universities list endpoints and their frontend consumers.
---

Admin Students and Universities lists moved from fetch-all-and-filter-client-side to server-side pagination (`page`, `limit`, `search`, filter params, `sortKey`/`sortDir`), returning `{ items, total, page, limit, totalPages, summary }`.

**Why:** whole-table fetches don't scale and duplicated filter/sort logic between client and server.

**How to apply:**
- `sortKey` values are backend-defined short aliases (e.g. `name`, `university`, `program`), not raw column/field names like `firstName` — frontend must send the alias, not the DB field name, or sorting silently falls back to the default order with no error.
- Any other caller of `fetchStudents()`/`fetchUniversities()` (e.g. admin dashboard summary, `getStudentProfileByUserId` lookups by userId) must be updated to read `.items` from the paginated result instead of treating the return value as an array directly — this is a common break point when converting a list endpoint to pagination.
- Universities list still sorts computed fields (`students` count, `semesters` count) client-side per page since those aren't DB columns; only DB-backed sort keys go server-side.
