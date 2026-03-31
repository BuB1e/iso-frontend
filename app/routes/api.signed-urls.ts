import { data } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { getSignedFileUrl } from "~/lib/s3storage.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { paths, bucket = "evidence" } = await request.json();

    if (!Array.isArray(paths)) {
      return data({ error: "Paths must be an array" }, { status: 400 });
    }

    const signedUrls = await Promise.all(
      paths.map(async (path: string) => {
        if (!path) return null;
        return await getSignedFileUrl(path, bucket);
      })
    );

    // Map original paths to signed URLs
    const mapping: Record<string, string | null> = {};
    paths.forEach((path, index) => {
      mapping[path] = signedUrls[index];
    });

    return { mapping };
  } catch (err) {
    console.error("Batch signing failed:", err);
    return data({ error: "Signing failed" }, { status: 500 });
  }
}
