import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { getUploadRoot, mimeForFilename } from "@/lib/upload-meta";
import { parseUploadPath } from "@/lib/upload-path";

import type { UploadReadResult, UploadStorage } from "./types";

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

    const pathInfo = parseUploadPath(relativePath);
    if (!pathInfo) return null;

    try {
      const fileStat = await stat(absPath);
      if (!fileStat.isFile()) return null;

      const nodeStream = createReadStream(absPath);
      const body = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

      return {
        pathInfo,
        size: fileStat.size,
        contentType: mimeForFilename(path.basename(absPath)),
        body,
      };
    } catch {
      return null;
    }
  }
}
