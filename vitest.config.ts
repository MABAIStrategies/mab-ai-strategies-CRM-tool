import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    environmentMatchGlobs: [["tests/{components,pages}/**/*.test.tsx", "jsdom"]],
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    exclude: ["e2e/**", "node_modules/**", "dist/**", ".next/**"]
  }
});
