import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // Load ALL env vars from .env files (empty prefix = include non-VITE_ vars too)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      proxy: {
        // Proxy /api requests to the backend during development
        "/api": {
          target: env.BACKEND_URL || "NO_BACKEND_URL_IN_CONFIG_ENV",
          changeOrigin: true,
        },
      },
    },
  };
});
