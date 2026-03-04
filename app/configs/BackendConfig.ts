import axios from "axios";

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

// Global Axios Interceptor to automatically attach Bearer token to all requests
axios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bearer_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
