import { createClient } from "@supabase/supabase-js";
import { BackendConfig } from "~/configs";

const supabaseUrl = BackendConfig.SUPABASE_URL;
const supabaseAnonKey = BackendConfig.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found in environment variables");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Generate unique filename to avoid collisions
async function getUniquePath(bucket: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const parts = safeName.split(".");
  const ext = parts.length > 1 ? `.${parts.pop()}` : "";
  const name = parts.join(".");

  const { data: files } = await supabase.storage.from(bucket).list("", {
    limit: 100,
    search: name,
  });

  const existingFiles = new Set(files?.map((f) => f.name));

  if (!existingFiles.has(safeName)) {
    return safeName;
  }

  let counter = 2;
  while (existingFiles.has(`${name}-${counter}${ext}`)) {
    counter++;
  }

  return `${name}-${counter}${ext}`;
}

// Helper to upload file to Supabase storage
export async function uploadToSupabase(
  file: File,
  bucket: string = "evidence",
): Promise<{ url: string; path: string } | null> {
  try {
    const path = await getUniquePath(bucket, file.name);

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
}

// Helper to delete file from Supabase storage
export async function deleteFromSupabase(
  fileUrl: string,
  bucket: string = "evidence",
): Promise<boolean> {
  try {
    // Extract the file path from the full URL
    const urlParts = fileUrl.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length !== 2) {
      console.error("Could not extract file path from URL:", fileUrl);
      return false;
    }

    const filePath = decodeURIComponent(urlParts[1]);

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Delete failed:", err);
    return false;
  }
}
