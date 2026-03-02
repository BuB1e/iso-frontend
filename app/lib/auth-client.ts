import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "", // Same origin — proxied to backend server-side
  fetchOptions: {
    credentials: "include",
  },
});
