import { S3StorageService } from "./s3";

export interface UploadInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface StorageService {
  upload(input: UploadInput): Promise<void>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

let cached: StorageService | undefined;

export function getStorageService(): StorageService {
  if (!cached) {
    cached = new S3StorageService();
  }
  return cached;
}
