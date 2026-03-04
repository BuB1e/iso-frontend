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
    onRequest: (ctx) => {
      // better-auth uses its own fetch client for `useSession()`, not axios!
      // We must manually attach our stored bearer token to its outgoing requests.
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("bearer_token");
        if (token && ctx.headers && !ctx.headers.get("authorization")) {
          ctx.headers.set("Authorization", `Bearer ${token}`);
        }
      }
    },
    onSuccess: (ctx) => {
      if (typeof window !== "undefined") {
        const url = ctx.request?.url?.toString?.() || "";

        // Only try to extract token from sign-in/sign-up responses
        if (url.includes("/sign-in") || url.includes("/sign-up")) {
          let authToken = ctx.response.headers.get("set-auth-token");
          const data = ctx.data as any;
          if (!authToken && data?.token) {
            authToken = data.token;
          } else if (!authToken && data?.session?.token) {
            authToken = data.session.token;
          }
          if (authToken) {
            localStorage.setItem("bearer_token", authToken);
          }
        }
      }
    },
  },
});
