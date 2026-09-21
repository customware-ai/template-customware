import { defineConfig } from "@playwright/test";

const playwrightPort = process.env.PLAYWRIGHT_PORT ?? "4444";
const playwrightBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${playwrightPort}`;
const helperOwnsSetupAndServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  globalSetup: helperOwnsSetupAndServer ? undefined : "./tests/e2e/global-setup.ts",
  use: {
    baseURL: playwrightBaseUrl,
    browserName: "chromium",
    launchOptions: {
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-setuid-sandbox",
      ],
    },
    trace: "on-first-retry",
  },
  ...(helperOwnsSetupAndServer
    ? {}
    : {
        webServer: {
          command: `PLAYWRIGHT_PORT=${playwrightPort} PORT=${playwrightPort} pnpm run start:e2e`,
          env: {
            ...process.env,
            PORT: playwrightPort,
            PLAYWRIGHT_BASE_URL: playwrightBaseUrl,
            PLAYWRIGHT_PORT: playwrightPort,
          },
          url: playwrightBaseUrl,
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }),
});
