import { BlobUploadStorage } from "./blobs";
import { FilesystemUploadStorage } from "./filesystem";
import type { UploadStorage } from "./types";

export type { UploadReadResult, UploadStorage } from "./types";

export function isBlobStorageBackend(): boolean {
  return process.env.UPLOAD_BACKEND === "blobs";
}

let storage: UploadStorage | null = null;

export function getUploadStorage(): UploadStorage {
  if (!storage) {
    storage = isBlobStorageBackend()
      ? new BlobUploadStorage()
      : new FilesystemUploadStorage();
  }
  return storage;
}

export async function storageSave(
  relativePath: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  return getUploadStorage().saveAtPath(relativePath, data, contentType);
}

export async function storageRead(relativePath: string) {
  return getUploadStorage().read(relativePath);
}
