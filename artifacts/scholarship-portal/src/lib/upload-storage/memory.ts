import { parseUploadPath, type UploadPathInfo } from "@/lib/upload-path";
import { mimeForFilename } from "@/lib/upload-meta";
import type { UploadReadResult, UploadStorage } from "./types";

const memoryStore: Record<string, { data: Uint8Array; contentType: string }> = {};

function pathKey(relativePath: string): string {
  return relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
}

export class MemoryUploadStorage implements UploadStorage {
  async saveAtPath(
    relativePath: string,
    data: Buffer | Uint8Array,
    contentType: string,
  ): Promise<string> {
    const key = pathKey(relativePath);
    memoryStore[key] = {
      data: data instanceof Uint8Array ? data : new Uint8Array(data),
      contentType,
    };
    return relativePath;
  }

  async read(relativePath: string): Promise<UploadReadResult | null> {
    const key = pathKey(relativePath);
    const entry = memoryStore[key];
    if (!entry) return null;

    const pathInfo = parseUploadPath(relativePath);
    if (!pathInfo) return null;

    return {
      pathInfo,
      size: entry.data.byteLength,
      contentType: entry.contentType || mimeForFilename(relativePath),
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(entry.data);
          controller.close();
        },
      }),
    };
  }
}

export function memoryReadAsDataUrl(relativePath: string): string | null {
  const key = pathKey(relativePath);
  const entry = memoryStore[key];
  if (!entry) return null;
  const b64 = btoa(
    Array.from(entry.data)
      .map((b) => String.fromCharCode(b))
      .join(""),
  );
  return `data:${entry.contentType};base64,${b64}`;
}
