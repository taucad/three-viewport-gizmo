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

## Safari canvas readback

Safari under safaridriver neutralizes 2D canvas readback (toDataURL identical for different content,
getImageData/createImageBitmap throw; even a 2D canvas uploaded to WebGL reads back identical), so label-pixel checks
are blocked there; WebGL readback of cleared targets works. `safari.mjs` runs readback controls first (`T.readback()`:
black vs white, "AAAA" vs "WWWW", red vs blue, through each channel) and blocks a font check whose channel cannot tell
them apart. Late-font redraw is verified in Chromium, Firefox and WebKit; in Safari the trace shows the redraw runs
after the face loads and measurement uses the face.

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

- **Firefox runs on one worker (C2).** Headed Firefox under Xvfb shares one X display. When another worker's browser
  maps or unmaps a window, Firefox hears a trusted `pointerout` and `pointerleave` from outside the page, and the gizmo
  correctly ends its hover. Any spec that reads the hover after `page.mouse.move` could then read nothing: the empty
  sample in `hitSize.spec.ts` (`…EE.EE…`), `projection.spec.ts` "the pointer hits what is drawn" and the `views.spec.ts`
  sphere hover. Reproduced locally by opening and closing contexts in a second worker. There were no misses when the
  second browser used its own display, or with one worker. The Firefox step therefore passes `--workers=1`. WebKit runs
  headless and keeps two workers.
- **Firefox, reversed depth.** Firefox has no `EXT_clip_control`, so three falls back to the default depth buffer and
  warns; `projection.spec.ts` expects that one warning on Firefox's WebGL reversed-depth case only.
- **WebKit and Safari: late web fonts and the ArcballControls L7 case** fail here; both are library or harness fixes
  owned by another lane (P13-L6), not by this workflow.
