import { createAuthClient } from "better-auth/react";
import { BackendConfig } from "~/configs";

export const authClient = createAuthClient({
  baseURL: BackendConfig.BACKEND_URL,
  fetchOptions: {
    credentials: "include", // Required for cross-origin cookie auth
  },
});
