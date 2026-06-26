export type UploadReadResult = {
  ownerStudentId: string;
  size: number;
  contentType: string;
  body: ReadableStream<Uint8Array>;
};

export interface UploadStorage {
  saveAtPath(
    relativePath: string,
    data: Buffer,
    contentType: string,
  ): Promise<string>;
  read(relativePath: string): Promise<UploadReadResult | null>;
}
