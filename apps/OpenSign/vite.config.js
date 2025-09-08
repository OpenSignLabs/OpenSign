import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (no prefix filter)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      svgr() // Transform SVGs into React components
    ],
    resolve: { alias: {} }, // Add any necessary aliases here
    define: {
      // Replace process.env.REACT_APP_* with import.meta.env.VITE_*
      "process.env": Object.entries(env).reduce((acc, [key, value]) => {
        if (key.startsWith("REACT_APP_")) {
          acc[key] = value;
        }
        return acc;
      }, {})
    },
    build: {
      outDir: "build", // Keep the same output directory as CRA for compatibility
      rollupOptions: {
        // For public template as separate chunk
        input: {
          main: resolve(__dirname, "index.html")
        }
      }
    },
    server: {
      port: env.PORT || 3000, // Same port as CRA
      open: true
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./setuptest.js" // if you have one
    }
  };
});
