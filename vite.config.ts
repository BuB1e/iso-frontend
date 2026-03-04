import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // Load ALL env vars from .env files (empty prefix = include non-VITE_ vars too)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    // NOTE: Do NOT add server.proxy for /api here!
    // All /api/* requests must go through the React Router route at api.proxy.ts
    // which handles cookie rewriting, bearer token injection, and header manipulation.
  };
});
