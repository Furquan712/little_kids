import path from "node:path";
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

/**
 * Our keys carry a file extension (e.g. "contracts/x/NANNY-v1-signed.pdf"),
 * but Cloudinary treats the extension as delivery `format`, not part of the
 * public_id — leaving it in the public_id produces a mismatched delivery
 * path (Cloudinary appends its own detected format suffix on top of ours).
 * Splitting it here keeps every other call site free of that detail.
 */
function splitKey(key: string): { publicId: string; format?: string } {
  const ext = path.extname(key);
  if (!ext) return { publicId: key };
  return { publicId: key.slice(0, -ext.length), format: ext.slice(1) };
}

export class CloudinaryStorageService implements StorageService {
  async upload(input: UploadInput): Promise<void> {
    const { publicId } = splitKey(input.key);
    await new Promise<void>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
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
    const { publicId, format } = splitKey(key);

    // Authenticated-delivery URLs must reference the asset's real version —
    // "no version" resolves to a placeholder Cloudinary can't match, and
    // returns 404 even though the asset exists.
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: RESOURCE_TYPE,
      type: DELIVERY_TYPE,
    });

    return cloudinary.url(publicId, {
      resource_type: RESOURCE_TYPE,
      type: DELIVERY_TYPE,
      sign_url: true,
      secure: true,
      version: resource.version,
      format,
      ...(authTokenKey
        ? { auth_token: { key: authTokenKey, duration: expiresInSeconds } }
        : {}),
    });
  }

  async delete(key: string): Promise<void> {
    const { publicId } = splitKey(key);
    await cloudinary.uploader.destroy(publicId, { resource_type: RESOURCE_TYPE, type: DELIVERY_TYPE });
  }
}
