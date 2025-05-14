import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    process: JSON.stringify({
      env: {
        NODE_ENV: "production"
      }
    })
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/ee/script/PublicTemplate.jsx"),
      name: "PublicTemplate",
      fileName: () => `public-template.bundle.js`,
      formats: ["iife"]
    },
    outDir: "public/static/js",
    emptyOutDir: false,
    assetsInlineLimit: 0,
    copyPublicDir: false,
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
      output: {
        // 👇 Controls how asset files (like CSS) are named
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "public-template.bundle.css"; // Custom CSS filename
          }
          return "[name].[ext]";
        },
        globals: {}
      }
    }
  }
});
