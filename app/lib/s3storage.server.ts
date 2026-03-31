import { S3Client, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client configured for Cloudflare R2 (S3-compatible)
// S3 credentials — server-side only (process.env, never exposed to browser)
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || "NO_S3_ACCESS_KEY_ID_CONFIG_IN_ENV";
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || "NO_S3_SECRET_ACCESS_KEY_CONFIG_IN_ENV";
// Ensure S3_API has a protocol
const rawS3Api = process.env.S3_API || "NO_S3_API_CONFIG_IN_ENV";
const S3_API = rawS3Api.startsWith("http") ? rawS3Api : `https://${rawS3Api}`;
const S3_BUCKET = process.env.S3_BUCKET || "NO_S3_BUCKET_CONFIG_IN_ENV";

const s3 = new S3Client({
  region: "auto",
  endpoint: S3_API,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

const DEFAULT_BUCKET = S3_BUCKET;
// PUBLIC_URL should be the base for file access
const PUBLIC_URL = S3_API.replace(/\/$/, "");

// Helper to extract key from a full URL or path
function extractKey(fileUrlOrKey: string): string {
  if (!fileUrlOrKey) return "";
  
  let path = fileUrlOrKey;
  
  // 1. Handle full URLs
  if (path.startsWith("http")) {
    try {
      const url = new URL(path);
      path = decodeURIComponent(url.pathname);
    } catch (e) {
      // Fallback: strip protocol and host manually if URL is malformed
      const match = path.match(/^https?:\/\/[^\/]+(.*)/);
      if (match) path = decodeURIComponent(match[1]);
    }
  }
  
  // 2. Clean up path (remove leading slash)
  if (path.startsWith("/")) path = path.substring(1);
  
  // 3. Remove PUBLIC_URL prefix if it was passed as path (fallback for older browser logic)
  const cleanPublicUrl = PUBLIC_URL.replace(/^https?:\/\//, "");
  if (path.startsWith(cleanPublicUrl)) {
    path = path.substring(cleanPublicUrl.length).replace(/^\//, "");
  }

  // 4. If the bucket name is included in the URL path, strip it.
  // R2 endpoints often use account.r2.cloudflarestorage.com/bucket/key
  if (path.startsWith(`${S3_BUCKET}/`)) {
    path = path.substring(S3_BUCKET.length + 1);
  }

  return path;
}

// Generate a unique filename using a timestamp suffix
function buildUniquePath(fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const parts = safeName.split(".");
  const ext = parts.length > 1 ? `.${parts.pop()}` : "";
  const name = parts.join(".");
  return `${name}-${Date.now()}${ext}`;
}

// Upload a file to Cloudflare R2 — must be called from a server-side loader/action
export async function uploadFileToStorage(
  file: File,
  bucket: string = DEFAULT_BUCKET,
): Promise<{ url: string; path: string } | null> {
  try {
    const path = buildUniquePath(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucket,
        Key: path,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      },
    });

    await upload.done();

    return {
      url: `${PUBLIC_URL}/${path}`,
      path,
    };
  } catch (err) {
    console.error("R2 upload failed:", err);
    return null;
  }
}

/**
 * Generate a signed URL for a file in storage.
 * @param fileUrlOrKey The object key or the full public URL.
 * @param bucket The bucket name.
 * @param expiresIn Time in seconds until the URL expires (default 1 hour).
 */
export async function getSignedFileUrl(
  fileUrlOrKey: string,
  bucket: string = DEFAULT_BUCKET,
  expiresIn: number = 3600,
): Promise<string | null> {
  try {
    if (!fileUrlOrKey) return null;

    // If it's a full URL, extract the key using our robust helper
    const key = extractKey(fileUrlOrKey);

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return await getSignedUrl(s3 as any, command as any, { expiresIn });
  } catch (err) {
    console.error("R2 signed URL generation failed:", err);
    return null;
  }
}

// Delete a file from Cloudflare R2 — must be called from a server-side loader/action
export async function deleteFileFromStorage(
  fileUrl: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<boolean> {
  try {
    // Derive the object key by using our robust helper
    const path = extractKey(fileUrl);

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: path,
      }),
    );

    return true;
  } catch (err) {
    console.error("R2 delete failed:", err);
    return false;
  }
}

