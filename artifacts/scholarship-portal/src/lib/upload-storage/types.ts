import type { UploadPathInfo } from "@/lib/upload-path";

export type UploadReadResult = {
  pathInfo: UploadPathInfo;
  size: number;
  contentType: string;
  body: ReadableStream<Uint8Array>;
};

export interface UploadStorage {
  saveAtPath(
    relativePath: string,
    data: Buffer | Uint8Array,
    contentType: string,
  ): Promise<string>;
  read(relativePath: string): Promise<UploadReadResult | null>;
}
