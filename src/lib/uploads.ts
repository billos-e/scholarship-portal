import path from "node:path";
import { randomBytes } from "node:crypto";

import { mimeForFilename } from "@/lib/upload-meta";
import { storageRead, storageSave } from "@/lib/upload-storage";

/**
 * File upload helpers.
 *
 * Files are stored outside `public/` so they are not served as static assets.
 * Access goes through `/api/uploads/[...path]` which enforces authorization.
 *
 * Local dev: filesystem under UPLOAD_DIR (default `<repo>/uploads`).
 * Netlify prod: set UPLOAD_BACKEND=blobs (Netlify Blobs store).
 *
 * The string stored in the database is the path relative to the storage root,
 * e.g. `clx123/invoices/ab12cd34-tuition-fall-2026.pdf`.
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file

export type UploadKind = "invoices" | "transcripts" | "qr";

const ALLOWED_TYPES: Record<UploadKind, ReadonlySet<string>> = {
  invoices: new Set(["application/pdf", "image/jpeg", "image/png"]),
  transcripts: new Set(["application/pdf", "image/jpeg", "image/png"]),
  qr: new Set(["image/jpeg", "image/png"]),
};

const ALLOWED_EXT: Record<UploadKind, ReadonlySet<string>> = {
  invoices: new Set([".pdf", ".jpg", ".jpeg", ".png"]),
  transcripts: new Set([".pdf", ".jpg", ".jpeg", ".png"]),
  qr: new Set([".jpg", ".jpeg", ".png"]),
};

export const KIND_LABELS: Record<UploadKind, string> = {
  invoices: "Invoice",
  transcripts: "Transcript",
  qr: "QR payment image",
};

function safeFilename(name: string): string {
  const base = path
    .basename(name)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return base.length > 0 ? base : "file";
}

export function buildUploadRelativePath(
  opts: { studentId: string; kind: UploadKind },
  originalName: string,
): string {
  const token = randomBytes(8).toString("hex");
  const filename = `${token}-${safeFilename(originalName)}`;
  return path.posix.join(opts.studentId, opts.kind, filename);
}

export function validateUpload(
  file: File,
  kind: UploadKind,
): { ok: true } | { ok: false; error: string } {
  if (file.size === 0) {
    return { ok: false, error: `${KIND_LABELS[kind]} file is empty.` };
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `${KIND_LABELS[kind]} must be 10 MB or smaller.`,
    };
  }
  const ext = path.extname(file.name).toLowerCase();
  const typeOk = ALLOWED_TYPES[kind].has(file.type);
  const extOk = ALLOWED_EXT[kind].has(ext);
  if (!typeOk && !extOk) {
    return {
      ok: false,
      error: `${KIND_LABELS[kind]} must be PDF, JPG, or PNG.`,
    };
  }
  return { ok: true };
}

export async function saveUpload(
  file: File,
  opts: { studentId: string; kind: UploadKind },
): Promise<string> {
  const check = validateUpload(file, opts.kind);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const relativePath = buildUploadRelativePath(opts, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || mimeForFilename(file.name);

  await storageSave(relativePath, buffer, contentType);
  return relativePath;
}

export async function readUpload(relativePath: string) {
  return storageRead(relativePath);
}

/** @deprecated Use readUpload instead. */
export async function resolveUploadPath(relativePath: string) {
  const result = await readUpload(relativePath);
  if (!result) return null;
  return {
    ownerStudentId: result.ownerStudentId,
    size: result.size,
    contentType: result.contentType,
    body: result.body,
  };
}

export { getUploadRoot, mimeForFilename } from "@/lib/upload-meta";
