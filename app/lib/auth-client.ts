import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "", // Same origin — proxied to backend server-side
  // No Bearer token config — the backend uses cookies, not Bearer tokens.
  // Cookies are automatically sent via credentials: "include" (better-auth default).
  // The proxy at api.proxy.ts handles cookie name rewriting for localhost.
});
