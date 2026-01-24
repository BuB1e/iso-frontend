import { createClient } from "@supabase/supabase-js";
import { BackendConfig } from "~/configs";

const supabaseUrl = BackendConfig.SUPABASE_URL;
const supabaseAnonKey = BackendConfig.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found in environment variables");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Helper to upload file to Supabase storage
export async function uploadToSupabase(
  file: File,
  bucket: string = "evidence",
): Promise<{ url: string; path: string } | null> {
  try {
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${timestamp}_${safeName}`;

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
    // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket/filename
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
