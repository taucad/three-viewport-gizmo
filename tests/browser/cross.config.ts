/**
 * P13 cross-browser, touch and accessibility coverage, run by `.github/workflows/cross-browser.yml` and never by the
 * required browser gate (`playwright.config.ts`). Specs here end in `.cross.ts`, so the gate's `*.spec.ts` match never
 * picks them up. See `tests/browser/cross/README.md`.
 *
 * Projects:
 * - `webgl`: the H1 functional specs (views, gate, input and the lib browser cases) plus the adapter probe and the
 *   accessibility-tree checks, in the engine `GIZMO_BROWSER` names (chromium, firefox or webkit). The name stays
 *   `webgl` because the shared fixtures read the backend from it. Titles that need WebGPU, Chromium's CDP touch
 *   input or V8 flags are left out on Firefox and WebKit: see `chromiumOnly`.
 * - `touch-iphone` (WebKit, iPhone 15) and `touch-android` (Chromium, Pixel 7): emulated touch.
 * - `axe`: axe-core scans of the docs site and the gizmo test pages (Chromium).
 */
import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";
import { gpuArgs } from "./gpu.mjs";

const port = Number(process.env.GIZMO_GATE_PORT ?? 4179);
const sitePort = port + 1;
const site = existsSync(new URL("../../site/out/index.html", import.meta.url));
const browserName = (process.env.GIZMO_BROWSER ?? "chromium") as "chromium" | "firefox" | "webkit";
const out = `../../test-results/cross/${process.env.GIZMO_RUN ?? browserName}`;

/**
 * Left out off Chromium: WebGPU cases (no WebGPU in Playwright's Linux Firefox or WebKit; the WebGPU fixture launches
 * Chromium), CDP touch input (`Input.dispatchTouchEvent`, Chromium only; emulated touch runs in the touch projects)
 * and the allocation case, which needs V8 flags and CDP heap sampling.
 */
const chromiumOnly = [/webgpu/i, /touch|finger/i, /allocation budget/];

/** Chromium takes the gate's GPU flags (SwiftShader on Linux, Metal on macOS); Firefox is forced onto WebGL. */
const launch = {
  chromium: { args: gpuArgs },
  // The perf harness reads WEBGL_debug_renderer_info, which Firefox warns is deprecated; the gate counts warnings, so
  // the extension is turned off (the harness then records no renderer string).
  firefox: { firefoxUserPrefs: { "webgl.force-enabled": true, "webgl.disabled": false, "webgl.enable-debug-renderer-info": false } },
  webkit: {},
}[browserName];

export default defineConfig({
  testDir: "../..",
  outputDir: out,
  reporter: [["list"], ...(process.env.CI ? ([["github"]] as const) : []), ["json", { outputFile: `${out}/report.json` }]],
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1,
  timeout: 60_000,
  // One retry in CI, so a failure that passes on retry reads as flaky in the summary rather than as an engine finding.
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1280, height: 800 },
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "webgl",
      use: { browserName, launchOptions: launch, headless: !process.env.GIZMO_HEADED },
      grepInvert: browserName === "chromium" ? undefined : chromiumOnly,
      testMatch: [
        "tests/browser/views.spec.ts",
        "tests/browser/gate.spec.ts",
        "tests/browser/input.spec.ts",
        "lib/__tests__/browser/**/*.spec.ts",
        "tests/browser/cross/adapter.cross.ts",
        "tests/browser/cross/a11y-tree.cross.ts",
        "tests/browser/cross/fonts.cross.ts",
        "tests/browser/cross/arcball.cross.ts",
      ],
    },
    { name: "touch-iphone", use: { ...devices["iPhone 15"] }, testMatch: "tests/browser/cross/touch.cross.ts" },
    { name: "touch-android", use: { ...devices["Pixel 7"], launchOptions: { args: gpuArgs } }, testMatch: "tests/browser/cross/touch.cross.ts" },
    { name: "axe", use: { browserName: "chromium", launchOptions: { args: gpuArgs } }, testMatch: "tests/browser/cross/axe.cross.ts" },
  ],
  webServer: [
    {
      command: `npx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port ${port}`,
      cwd: "../..",
      url: `http://127.0.0.1:${port}/perf/harness.html`,
      reuseExistingServer: !process.env.CI,
    },
    ...(site
      ? [
          {
            command: `npx vite preview --config tests/browser/vite.config.ts --outDir site/out --base /three-viewport-gizmo/ --host 127.0.0.1 --port ${sitePort} --strictPort`,
            cwd: "../..",
            url: `http://127.0.0.1:${sitePort}/three-viewport-gizmo/`,
            reuseExistingServer: !process.env.CI,
          },
        ]
      : []),
  ],
});

export { sitePort };
