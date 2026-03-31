import type { LoaderFunctionArgs } from "react-router";
import { getSignedFileUrl } from "~/lib/s3storage.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  const bucket = url.searchParams.get("bucket") || "evidence";

  if (!path) {
    return new Response("Missing path parameter", { status: 400 });
  }

  const signedUrl = await getSignedFileUrl(path, bucket);

  if (!signedUrl) {
    return new Response("Failed to generate signed URL", { status: 500 });
  }

  return { signedUrl };
}
