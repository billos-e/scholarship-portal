import { getStore } from "@netlify/blobs";

import { mimeForFilename } from "@/lib/upload-meta";
import { parseUploadPath } from "@/lib/upload-path";

import type { UploadReadResult, UploadStorage } from "./types";

const STORE_NAME = "scholarship-uploads";

export class BlobUploadStorage implements UploadStorage {
  private async store() {
    return getStore({ name: STORE_NAME, consistency: "strong" });
  }

  async saveAtPath(
    relativePath: string,
    data: Buffer,
    contentType: string,
  ): Promise<string> {
    const store = await this.store();
    const arrayBuffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
    await store.set(relativePath, arrayBuffer, {
      metadata: { contentType },
    });
    return relativePath;
  }

  async read(relativePath: string): Promise<UploadReadResult | null> {
    const pathInfo = parseUploadPath(relativePath);
    if (!pathInfo) return null;

    const store = await this.store();
    const result = await store.getWithMetadata(relativePath, {
      type: "arrayBuffer",
    });
    if (!result) return null;

    const buffer = Buffer.from(result.data as ArrayBuffer);
    const contentType =
      (result.metadata?.contentType as string | undefined) ??
      mimeForFilename(relativePath);

    return {
      pathInfo,
      size: buffer.byteLength,
      contentType,
      body: new Blob([buffer], { type: contentType }).stream(),
    };
  }
}
