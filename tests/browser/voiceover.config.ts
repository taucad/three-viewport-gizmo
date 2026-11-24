/**
 * P13 VoiceOver smoke on a macOS runner, through @guidepup/playwright: headed Playwright WebKit, one worker, VoiceOver
 * started for each test. Not a dependency of the package: the workflow installs `@guidepup/guidepup` and
 * `@guidepup/playwright` with `npm install --no-save` and prepares the runner with `npx @guidepup/setup setup --ci`.
 * See `tests/browser/cross/README.md`.
 */
import { devices } from "@playwright/test";
import { withGuidepup } from "@guidepup/playwright";

const port = Number(process.env.GIZMO_GATE_PORT ?? 4179);

export default withGuidepup({
  testDir: "../..",
  testMatch: "tests/browser/cross/voiceover.cross.ts",
  outputDir: "../../test-results/cross/voiceover",
  reporter: [["list"], ...(process.env.CI ? ([["github"]] as const) : [])],
  reportSlowTests: null,
  timeout: 5 * 60 * 1000,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "retain-on-failure", video: "retain-on-failure" },
  projects: [{ name: "voiceover-webkit", use: { ...devices["Desktop Safari"] } }],
  webServer: {
    command: `npx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port ${port}`,
    cwd: "../..",
    url: `http://127.0.0.1:${port}/perf/harness.html`,
    reuseExistingServer: !process.env.CI,
  },
});
