import { memoryReadAsDataUrl } from "@/lib/upload-storage";

export type UploadPathInfo =
  | { type: "student"; ownerStudentId: string }
  | { type: "university"; universityId: string };

export function parseUploadPath(relativePath: string): UploadPathInfo | null {
  const parts = relativePath.split("/").filter(Boolean);
  if (parts[0] === "universities" && parts[1]) {
    return { type: "university", universityId: parts[1] };
  }
  if (parts[0]) {
    return { type: "student", ownerStudentId: parts[0] };
  }
  return null;
}

export function uploadPublicUrl(relativePath: string): string {
  if (!relativePath) return "";
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://") ||
    relativePath.startsWith("data:") ||
    relativePath.startsWith("blob:")
  ) {
    return relativePath;
  }
  // Files uploaded via the real object-storage flow (uploadFileToStorage)
  // are stored as complete, already-fetchable app URLs, e.g.
  // "/api/storage/objects/uploads/<id>?ct=...&name=...". These must be
  // returned as-is: re-wrapping them under /api/uploads/ (the legacy
  // in-memory upload route) would double-encode the embedded query string
  // and 404, since that route never sees storage-backed paths.
  if (relativePath.includes("/api/storage/") || relativePath.includes("?")) {
    return relativePath;
  }
  const dataUrl = memoryReadAsDataUrl(relativePath);
  if (dataUrl) return dataUrl;
  return `/api/uploads/${relativePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}
