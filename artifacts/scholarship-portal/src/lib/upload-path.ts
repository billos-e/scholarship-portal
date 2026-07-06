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
  const dataUrl = memoryReadAsDataUrl(relativePath);
  if (dataUrl) return dataUrl;
  return `/api/uploads/${relativePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}
