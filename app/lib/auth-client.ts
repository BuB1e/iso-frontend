import { createAuthClient } from "better-auth/react";
import { BackendConfig } from "~/configs";

export const authClient = createAuthClient({
  baseURL: BackendConfig.BACKEND_URL,
});
