import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

/**
 * File upload helpers.
 *
 * Files are stored outside `public/` so they are not served as static assets.
 * Access goes through `/api/uploads/[...path]` which enforces authorization
 * (see that route). The on-disk path is:
 *
 *   <UPLOAD_ROOT>/<studentId>/<kind>/<token>-<safeName>
 *
 * The string stored in the database is the path relative to `UPLOAD_ROOT`,
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

export function getUploadRoot(): string {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(process.cwd(), "uploads");
}

function safeFilename(name: string): string {
  const base = path
    .basename(name)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return base.length > 0 ? base : "file";
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

  const root = getUploadRoot();
  const dir = path.join(root, opts.studentId, opts.kind);
  await mkdir(dir, { recursive: true });

  const token = randomBytes(8).toString("hex");
  const filename = `${token}-${safeFilename(file.name)}`;
  const absPath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, buffer);

  return path.posix.join(opts.studentId, opts.kind, filename);
}

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

export function mimeForFilename(name: string): string {
  return MIME_BY_EXT[path.extname(name).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Resolve a stored relative path to an absolute path on disk.
 * Returns null if the path escapes the upload root or does not exist.
 */
export async function resolveUploadPath(
  relativePath: string,
): Promise<{ absPath: string; ownerStudentId: string; size: number } | null> {
  const root = getUploadRoot();
  const absPath = path.resolve(root, relativePath);
  if (!absPath.startsWith(root + path.sep)) return null;

  const rel = path.relative(root, absPath);
  const [ownerStudentId] = rel.split(path.sep);
  if (!ownerStudentId) return null;

  try {
    const s = await stat(absPath);
    if (!s.isFile()) return null;
    return { absPath, ownerStudentId, size: s.size };
  } catch {
    return null;
  }
}

export function readUploadStream(absPath: string) {
  return createReadStream(absPath);
}
