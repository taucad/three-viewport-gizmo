# Cross-browser, touch and accessibility coverage

The required browser gate (`ci.yml` `browser-gate`, `tests/browser/playwright.config.ts`) runs Chromium only, on
SwiftShader. This directory adds what it never covered. It runs in `.github/workflows/cross-browser.yml`, a separate
workflow whose jobs are not required: a red job here is evidence to triage, not a release block.

| Job | Runner | What runs |
| --- | --- | --- |
| `linux firefox`, `linux webkit` | ubuntu-24.04 | The H1 functional specs on WebGL (`views`, `gate`, `input` and `lib/__tests__/browser/*.spec.ts`), the adapter probe and the accessibility-tree checks, in Playwright's Firefox or WebKit |
| `touch-a11y` | ubuntu-24.04 | Emulated touch as iPhone 15 (WebKit) and Pixel 7 (Chromium); axe-core on the built docs site and the gizmo pages; Chromium's own accessibility tree |
| `macos-chrome-metal` | macos-15 | The adapter probe, then the gate's specs on WebGL and WebGPU, in Chromium on the runner's GPU through Metal |
| `macos-safari` | macos-15 | Real Safari through safaridriver (`safari.mjs`), then the functional specs in Playwright's WebKit on macOS |
| `voiceover` | macos-15 | VoiceOver over headed Playwright WebKit with Guidepup (`voiceover.cross.ts`) |

Each job writes a summary (`summary.mjs`): pass and fail counts per project, the adapter, axe violations by rule, the
Safari checks and the VoiceOver transcript. The raw files are in the job's artifact.

## Known engine bugs

`safari.mjs` records a check as `known`, apart from passes and failures, only when its own evidence matches a bug:

- **WebKit: FontFace API face drawn with fallback in 2D canvas** (Safari 27.2). A face added with
  `document.fonts.add()` and loaded is measured by `measureText` but drawn with the fallback by `fillText`, so the
  late-font case (`T.lateFont()`) redraws once yet shows no change. Its trace's final `draw` step shows the label
  context measuring the face while a fresh canvas draws the fallback. `webkit-fontface-canvas.html` is a standalone
  repro for a WebKit report. The CSS `@font-face` case (`T.cssFont()`) is checked separately and stays a failure if
  it fails.

## What is left out, and why

- **WebGPU off Chromium.** Playwright's Linux Firefox and WebKit have no WebGPU, and the WebGPU fixture launches
  Chromium, so titles naming WebGPU are filtered out there (`chromiumOnly` in `../cross.config.ts`). Safari's WebGPU
  runs in `safari.mjs` when the probe finds three's WebGPURenderer on the WebGPU backend.
- **CDP-only input off Chromium.** The touch cases in `input`, `views` and `pointerSession` drive
  `Input.dispatchTouchEvent`, and the allocation case needs V8 flags; both are Chromium only.
- **Touch drag on WebKit.** Playwright gives WebKit `tap` but no touch-move, so the drag case runs on Chromium only.
- **Real devices.** All touch here is emulation. No real iPhone, iPad or Android phone is exercised.
- **The screenshot matrix.** Its references are per GPU and platform (`swiftshader-linux`, `metal-darwin` from the
  reference Mac); a runner's GPU or another engine draws different pixels.

## Running locally

Install the engines once with `npx playwright install chromium firefox webkit` (the touch-android and axe projects use
Chromium; CI installs its own), then from the repository root:

```sh
GIZMO_BROWSER=firefox npx playwright test -c tests/browser/cross.config.ts --project=webgl
npx playwright test -c tests/browser/cross.config.ts --project=touch-iphone --project=touch-android
npm install --no-save axe-core@4.11.0 && npx nx run three-viewport-gizmo:docs \
  && npx playwright test -c tests/browser/cross.config.ts --project=axe
```

On a Mac: `sudo safaridriver --enable` once, then `node tests/browser/cross/safari.mjs`. VoiceOver needs
`npm install --no-save @guidepup/guidepup@0.40.0 @guidepup/playwright@0.21.0`, `npx @guidepup/setup setup` (see
guidepup.dev for the manual steps on a personal Mac) and `npx @guidepup/setup install voiceover`, then
`npx playwright test -c tests/browser/voiceover.config.ts`. It takes over the screen and speaks.

`GIZMO_GATE_PORT` moves the Vite server off 4179 when another checkout already serves there.

## Known issues

- **Firefox, `hitSize.spec.ts` "a live edges.hitSize hovers as the same size passed at construction"** (flaky). After
  `set({})` returns to Auto, one of the 41 sweep samples can come back empty (`…EE.EE…` against `…EEEEE…` at
  construction); it failed both attempts in one run and passed on retry in the next. Not yet reproduced outside CI: a
  hover race after `set()` and Firefox's fractional pointer coordinates landing on a seam are both open. Left as is.
- **Firefox, reversed depth.** Firefox has no `EXT_clip_control`, so three falls back to the default depth buffer and
  warns; `projection.spec.ts` expects that one warning on Firefox's WebGL reversed-depth case only.
- **WebKit and Safari: late web fonts and the ArcballControls L7 case** fail here; both are library or harness fixes
  owned by another lane (P13-L6), not by this workflow.
