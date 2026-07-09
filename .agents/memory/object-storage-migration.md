---
name: Object storage migration (base64 -> real GCS-backed storage)
description: Scholarship portal moved from base64 data-URL file storage to Replit Object Storage; how uploads flow and how image detection works now.
---

Scholarship portal originally stored all uploaded files (invoices, transcripts, screenshots, profile/university photos) as base64 text embedded directly in Postgres, exposed to the browser as `data:` URLs. This broke `window.open()` (blocked for `data:` URLs) and made large PDFs unreliable in `<iframe>`.

**New flow:** client requests a presigned PUT URL from the API server (`POST /api/storage/uploads/request-url`), uploads the file directly to GCS-backed Object Storage, then reads/downloads go through `GET /api/storage/objects/:path` on the API server (proxied, not a raw bucket URL). The resulting URL is a real HTTP(S) URL, not a data URL.

**Why this matters for image detection:** object storage URLs are content-addressed (`/api/storage/objects/uploads/<uuid>`) with no filename or extension in the path. Any code that classified files as image-vs-document by sniffing the URL's file extension (or `data:image/` prefix) breaks silently once URLs stop carrying extensions.

**How it's solved here:** the upload helper (`uploads.ts`) appends the original filename and content-type as query params (`?ct=<mime>&name=<filename>`) on the returned URL. `isFileImage()`/`getExtension()` in `file-preview-modal.tsx` check these query params as a fallback after checking the path extension and `data:image/` prefix. Any new file-type-detection logic in this app must go through `isFileImage()`/`getExtension()` rather than re-deriving from the raw path — otherwise it will silently misclassify all newly-uploaded files.

**How to apply:** if adding new upload call sites or new file-preview UI, always route detection through the shared helpers in `file-preview-modal.tsx`, and always call the new `uploadFileToStorage()` helper (not manual base64/FileReader conversion) for new uploads.
