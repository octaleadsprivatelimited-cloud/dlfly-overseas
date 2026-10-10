import { defineConfig, devices } from "@playwright/test";
const productionOrigin = process.env["DLFLY_TEST_ORIGIN"];
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  fullyParallel: true,
  workers: 3,
  use: { baseURL: productionOrigin || "http://127.0.0.1:4178", trace: "retain-on-failure" },
  reporter: [["list"], ["html", { open: "never" }]],
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "small-phone",
      use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 700 } },
    },
    { name: "android", use: { ...devices["Pixel 7"] } },
    {
      name: "tablet",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    { name: "iphone-safari", use: { ...devices["iPhone 13"] } },
  ],
  ...(productionOrigin
    ? {}
    : {
        webServer: {
          command: "HOST=127.0.0.1 PORT=4178 node .output/server/index.mjs",
          url: "http://127.0.0.1:4178",
          reuseExistingServer: false,
          timeout: 30000,
        },
      }),
});
