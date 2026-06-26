import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { getUploadRoot, mimeForFilename } from "@/lib/upload-meta";

import type { UploadReadResult, UploadStorage } from "./types";

function ownerFromRelativePath(relativePath: string): string | null {
  const [ownerStudentId] = relativePath.split("/");
  return ownerStudentId || null;
}

export class FilesystemUploadStorage implements UploadStorage {
  async saveAtPath(
    relativePath: string,
    data: Buffer,
  ): Promise<string> {
    const root = getUploadRoot();
    const absPath = path.resolve(root, relativePath);
    if (!absPath.startsWith(root + path.sep)) {
      throw new Error("Invalid upload path.");
    }
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, data);
    return relativePath;
  }

  async read(relativePath: string): Promise<UploadReadResult | null> {
    const root = getUploadRoot();
    const absPath = path.resolve(root, relativePath);
    if (!absPath.startsWith(root + path.sep)) return null;

    const ownerStudentId = ownerFromRelativePath(relativePath);
    if (!ownerStudentId) return null;

    try {
      const fileStat = await stat(absPath);
      if (!fileStat.isFile()) return null;

      const nodeStream = createReadStream(absPath);
      const body = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

      return {
        ownerStudentId,
        size: fileStat.size,
        contentType: mimeForFilename(path.basename(absPath)),
        body,
      };
    } catch {
      return null;
    }
  }
}
