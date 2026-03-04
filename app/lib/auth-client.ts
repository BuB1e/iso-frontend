import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "", // Same origin — proxied to backend server-side
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => {
        if (typeof window !== "undefined") {
          return localStorage.getItem("bearer_token") || "";
        }
        return "";
      },
    },
    onSuccess: (ctx) => {
      if (typeof window !== "undefined") {
        const authToken = ctx.response.headers.get("set-auth-token");
        if (authToken) {
          localStorage.setItem("bearer_token", authToken);
        }
      }
    },
  },
});
