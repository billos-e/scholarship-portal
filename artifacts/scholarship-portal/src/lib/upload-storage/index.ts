import { MemoryUploadStorage, memoryReadAsDataUrl } from "./memory";
import type { UploadStorage } from "./types";

export type { UploadReadResult, UploadStorage } from "./types";
export { memoryReadAsDataUrl } from "./memory";

let storage: UploadStorage | null = null;

export function getUploadStorage(): UploadStorage {
  if (!storage) {
    storage = new MemoryUploadStorage();
  }
  return storage;
}

export async function storageSave(
  relativePath: string,
  data: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  return getUploadStorage().saveAtPath(relativePath, data, contentType);
}

export async function storageRead(relativePath: string) {
  return getUploadStorage().read(relativePath);
}
