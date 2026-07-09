import path from "node:path";
import { randomBytes } from "node:crypto";

import { mimeForFilename } from "@/lib/upload-meta";
import { storageRead, storageSave, memoryReadAsDataUrl } from "@/lib/upload-storage";

/**
 * File upload helpers.
 *
 * In the browser build files are stored in memory (MemoryUploadStorage).
 * Access goes through data URLs or the upload API route.
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file

export type StudentUploadKind =
  | "invoices"
  | "transcripts"
  | "qr"
  | "profile-photo";

export type UploadKind = StudentUploadKind | "university-image";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOC_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

const ALLOWED_TYPES: Record<UploadKind, ReadonlySet<string>> = {
  invoices: DOC_TYPES,
  transcripts: DOC_TYPES,
  qr: IMAGE_TYPES,
  "profile-photo": IMAGE_TYPES,
  "university-image": IMAGE_TYPES,
};

const ALLOWED_EXT: Record<UploadKind, ReadonlySet<string>> = {
  invoices: new Set([".pdf", ".jpg", ".jpeg", ".png"]),
  transcripts: new Set([".pdf", ".jpg", ".jpeg", ".png"]),
  qr: new Set([".jpg", ".jpeg", ".png", ".webp"]),
  "profile-photo": new Set([".jpg", ".jpeg", ".png", ".webp"]),
  "university-image": new Set([".jpg", ".jpeg", ".png", ".webp"]),
};

export const KIND_LABELS: Record<UploadKind, string> = {
  invoices: "Invoice",
  transcripts: "Transcript",
  qr: "Screenshot upload",
  "profile-photo": "Profile photo",
  "university-image": "University image",
};

function safeFilename(name: string): string {
  const base = path
    .basename(name)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return base.length > 0 ? base : "file";
}

export function buildStudentUploadPath(
  opts: { studentId: string; kind: StudentUploadKind },
  originalName: string,
): string {
  const token = randomBytes(8).toString("hex");
  const filename = `${token}-${safeFilename(originalName)}`;
  return path.posix.join(opts.studentId, opts.kind, filename);
}

export function buildUniversityImagePath(
  universityId: string,
  originalName: string,
): string {
  const token = randomBytes(8).toString("hex");
  const filename = `${token}-${safeFilename(originalName)}`;
  return path.posix.join("universities", universityId, filename);
}

/** @deprecated Use buildStudentUploadPath */
export function buildUploadRelativePath(
  opts: { studentId: string; kind: StudentUploadKind },
  originalName: string,
): string {
  return buildStudentUploadPath(opts, originalName);
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
    const hint =
      kind === "profile-photo" || kind === "university-image"
        ? "JPG, PNG, or WebP."
        : "PDF, JPG, or PNG.";
    return {
      ok: false,
      error: `${KIND_LABELS[kind]} must be ${hint}`,
    };
  }
  return { ok: true };
}

export async function saveStudentUpload(
  file: File,
  opts: { studentId: string; kind: StudentUploadKind },
): Promise<string> {
  const check = validateUpload(file, opts.kind);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const relativePath = buildStudentUploadPath(opts, file.name);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const contentType = file.type || mimeForFilename(file.name);

  await storageSave(relativePath, buffer, contentType);
  return relativePath;
}

export async function saveUniversityImage(
  file: File,
  universityId: string,
): Promise<string> {
  const check = validateUpload(file, "university-image");
  if (!check.ok) {
    throw new Error(check.error);
  }

  const relativePath = buildUniversityImagePath(universityId, file.name);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const contentType = file.type || mimeForFilename(file.name);

  await storageSave(relativePath, buffer, contentType);
  return relativePath;
}

/** @deprecated Use saveStudentUpload */
export async function saveUpload(
  file: File,
  opts: { studentId: string; kind: StudentUploadKind },
): Promise<string> {
  return saveStudentUpload(file, opts);
}

export async function readUpload(relativePath: string) {
  return storageRead(relativePath);
}

const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

/**
 * Uploads a file to object storage using the presigned-URL flow and returns
 * a real, shareable URL that can be embedded in an <iframe>, opened in a new
 * tab, or downloaded directly — unlike base64 data URLs, which browsers
 * refuse to top-level-navigate to and which iframes render unreliably.
 */
export async function uploadFileToStorage(file: File): Promise<string> {
  const requestRes = await fetch(`${apiBase}/api/storage/uploads/request-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!requestRes.ok) {
    throw new Error("Failed to get an upload URL. Please try again.");
  }
  const { uploadURL, objectPath } = (await requestRes.json()) as {
    uploadURL: string;
    objectPath: string;
  };

  const putRes = await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!putRes.ok) {
    throw new Error("Failed to upload file to storage. Please try again.");
  }

  const contentType = file.type || "application/octet-stream";
  const params = new URLSearchParams({ ct: contentType, name: file.name });
  return `${apiBase}/api/storage${objectPath}?${params.toString()}`;
}

export { getUploadRoot, mimeForFilename } from "@/lib/upload-meta";
