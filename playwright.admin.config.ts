import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/admin-e2e",
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: 1,
  use: { baseURL: "http://localhost:4180", trace: "retain-on-failure" },
  webServer: {
    command:
      "VITE_USE_FIREBASE_EMULATORS=true VITE_FIREBASE_PROJECT_ID=demo-dlfly-overseas VITE_GA4_MEASUREMENT_ID= VITE_CLARITY_PROJECT_ID= vite dev --host 127.0.0.1 --port 4180",
    url: "http://localhost:4180",
    timeout: 30000,
  },
});
