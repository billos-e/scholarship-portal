---
name: Uploaded file links broken outside the Repl dev tab (double-wrapped URL)
description: uploadPublicUrl() re-wrapped already-complete object-storage URLs, producing a mangled /api/uploads/api/storage/... link; only masked in-session by in-memory upload cache.
---

`uploadFileToStorage()` returns a complete, already-fetchable URL (e.g. `/api/storage/objects/uploads/<id>?ct=...&name=...`) and that's what gets stored in DB fields like `transcriptFileUrl`. But the renderer-side helper `uploadPublicUrl()` only recognized `http(s)://`, `data:`, `blob:` as "already complete" — any other string (including this storage URL) was treated as a raw legacy in-memory storage key, re-encoded segment-by-segment, and prefixed with `/api/uploads/`, corrupting the embedded `?ct=&name=` query string into a 404.

This was masked during same-tab testing because `uploadPublicUrl()` first checks an in-memory `Map` (`memoryReadAsDataUrl`) keyed by the raw upload path — a leftover from the pre-object-storage implementation — which only exists in the browser tab/session that performed the upload. Any other browser/tab has an empty map and falls through to the broken re-wrap path, producing a 404/`Cannot GET`.

**Fix:** `uploadPublicUrl()` now short-circuits and returns the value as-is when it already contains `/api/storage/` or a `?` query string, before touching the in-memory map or the legacy `/api/uploads/` wrapping logic.

**How to apply:** any time a "resolve stored path → public URL" helper exists alongside a "store already-complete URL" writer, verify the reader's "is this already a full URL" check covers every format the writer can produce — not just standard absolute URL schemes.
