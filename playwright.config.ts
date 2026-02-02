import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: `http://localhost:${process.env.PORT ?? 3000}`
  }
});
