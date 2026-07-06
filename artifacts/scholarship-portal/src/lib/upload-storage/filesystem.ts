// Filesystem backend is disabled in the browser build.
// All uploads go through MemoryUploadStorage (see index.ts).
import type { UploadReadResult, UploadStorage } from "./types";

export class FilesystemUploadStorage implements UploadStorage {
  async saveAtPath(_relativePath: string): Promise<string> {
    throw new Error("Filesystem storage is not available in the browser build.");
  }
  async read(_relativePath: string): Promise<UploadReadResult | null> {
    return null;
  }
}
