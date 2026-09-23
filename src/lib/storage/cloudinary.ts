import { v2 as cloudinary } from "cloudinary";
import type { StorageService, UploadInput } from "./index";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Every file this app stores is an image (JPEG/PNG) or a PDF — both of
 * which Cloudinary serves under the "image" resource type — so we never
 * need to track/persist which resource_type a given key was uploaded as.
 */
const RESOURCE_TYPE = "image" as const;
const DELIVERY_TYPE = "authenticated" as const;

export class CloudinaryStorageService implements StorageService {
  async upload(input: UploadInput): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: input.key,
          resource_type: RESOURCE_TYPE,
          type: DELIVERY_TYPE,
          overwrite: true,
        },
        (error) => (error ? reject(error) : resolve()),
      );
      stream.end(input.body);
    });
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 60): Promise<string> {
    // True time-limited links need Cloudinary's token-based authentication,
    // which requires an "Auth Token Key" configured in the account's
    // Security settings. Without CLOUDINARY_AUTH_TOKEN_KEY set, this still
    // returns a validly signed authenticated-delivery URL — access control
    // is enforced by our own route handlers before this is ever called, and
    // the URL is used for a single immediate redirect, never persisted.
    const authTokenKey = process.env.CLOUDINARY_AUTH_TOKEN_KEY;

    return cloudinary.url(key, {
      resource_type: RESOURCE_TYPE,
      type: DELIVERY_TYPE,
      sign_url: true,
      secure: true,
      ...(authTokenKey
        ? { auth_token: { key: authTokenKey, duration: expiresInSeconds } }
        : {}),
    });
  }

  async delete(key: string): Promise<void> {
    await cloudinary.uploader.destroy(key, { resource_type: RESOURCE_TYPE, type: DELIVERY_TYPE });
  }
}
