import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["**/tests/e2e/**", "**/node_modules/**"]
  }
});
