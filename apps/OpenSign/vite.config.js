import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";
import dotenv from "dotenv";

// Load env file based on mode
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react(),
      svgr() // Transform SVGs into React components
    ],
    resolve: {
      alias: {
        // Add any path aliases here if needed
      }
    },
    define: {
      // Replace process.env.REACT_APP_* with import.meta.env.VITE_*
      "process.env": {
        ...Object.keys(process.env).reduce((env, key) => {
          if (key.startsWith("REACT_APP_")) {
            env[key] = process.env[key];
          }
          return env;
        }, {})
      }
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
      port: process.env.PORT || 3000, // Same port as CRA
      open: true
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./setuptest.js" // if you have one
    }
  };
});
