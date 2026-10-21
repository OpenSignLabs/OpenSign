import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (no prefix filter). Also load .env.prod (deploy artifact) if present.
  const env = loadEnv(mode, process.cwd(), "");
  try {
    const prodPath = path.resolve(process.cwd(), ".env.prod");
    if (fs.existsSync(prodPath)) {
      const content = fs.readFileSync(prodPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx < 0) continue;
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (key && !(key in env)) env[key] = value;
      }
    }
  } catch (e) {
    // ignore
  }

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
    }
  };
});
