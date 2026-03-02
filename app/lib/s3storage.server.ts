import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// S3 client configured for Cloudflare R2 (S3-compatible)
// S3 credentials — server-side only (process.env, never exposed to browser)
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || "NO_S3_ACCESS_KEY_ID_CONFIG_IN_ENV";
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || "NO_S3_SECRET_ACCESS_KEY_CONFIG_IN_ENV";
const S3_API = process.env.S3_API || "NO_S3_API_CONFIG_IN_ENV";
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
const PUBLIC_URL = S3_API.replace(/\/$/, "");

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

// Delete a file from Cloudflare R2 — must be called from a server-side loader/action
export async function deleteFileFromStorage(
  fileUrl: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<boolean> {
  try {
    // Derive the object key by stripping the public base URL
    const path = decodeURIComponent(fileUrl.replace(`${PUBLIC_URL}/`, ""));

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

