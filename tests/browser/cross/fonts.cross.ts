/**
 * P13 triage probe for `labels.spec.ts` "a font loaded after construction appears with no set()", which failed on
 * Playwright WebKit (Linux). The library redraws its labels on `document.fonts` `loadingdone` (R25). This records, per
 * engine, whether and when `loadingdone` fires for a FontFace added to `document.fonts` and then loaded, which is what
 * a host does and what the case does. It asserts nothing about the gizmo; the timings are evidence.
 */
import { expect, test } from "@playwright/test";

test("fonts: loadingdone after document.fonts.add(face) and face.load()", async ({ page, browserName }, info) => {
  await page.goto("/tests/browser/cross/probe.html");
  await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
  const result = await page.evaluate(async () => {
    const events: { type: string; at: number; faces: number }[] = [];
    const t0 = performance.now();
    for (const type of ["loading", "loadingdone", "loadingerror"]) {
      document.fonts.addEventListener(type, (e) => events.push({ type, at: Math.round(performance.now() - t0), faces: (e as FontFaceSetLoadEvent).fontfaces?.length ?? -1 }));
    }
    const face = new FontFace("P13ProbeFont", "url(/tests/browser/fixtures/geist-latin.woff2)", { weight: "100 900" });
    document.fonts.add(face);
    await face.load();
    const loadedAt = Math.round(performance.now() - t0);
    await new Promise((r) => setTimeout(r, 2_000));
    return { loadedAt, status: face.status, setStatus: document.fonts.status, events };
  });
  const record = { browserName, ...result };
  info.annotations.push({ type: "fonts", description: JSON.stringify(record) });
  console.log(`[fonts ${browserName}] ${JSON.stringify(record)}`);
  expect(result.status).toBe("loaded");
});
