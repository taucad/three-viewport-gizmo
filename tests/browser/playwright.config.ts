import { defineConfig } from "@playwright/test";
import { backends, gpu, gpuArgs } from "./gpu.mjs";

const port = Number(process.env.GIZMO_GATE_PORT ?? 4179);

export default defineConfig({
  testDir: "../..",
  outputDir: "../../test-results/browser",
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1280, height: 800 },
    launchOptions: { args: gpuArgs },
  },
  // Lanes outside tests/browser add cases under lib/__tests__/browser (I2, S1); those specs pick their
  // own backend, so they run once, in the first project.
  projects: backends.map((name, i) => ({
    name,
    metadata: { gpu },
    testMatch: i === 0 ? ["tests/browser/**/*.spec.ts", "lib/__tests__/browser/**/*.spec.ts"] : "tests/browser/**/*.spec.ts",
  })),
  webServer: {
    command: `npx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port ${port}`,
    cwd: "../..",
    url: `http://127.0.0.1:${port}/perf/harness.html`,
    reuseExistingServer: !process.env.CI,
  },
});
