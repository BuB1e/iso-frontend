/**
 * Returns the base URL for API calls.
 * - Server-side (Node.js): returns the full backend URL from process.env
 * - Client-side (browser): returns empty string (requests go through the proxy)
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side: axios needs an absolute URL
    return process.env.BACKEND_URL || "";
  }
  // Client-side: relative URL, proxied by Vite (dev) or api.proxy route (prod)
  return "";
}
