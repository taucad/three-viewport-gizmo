/**
 * P13 browser cases for `fieldOfView`: every gizmo type, with and without the triad, keeps its face-on drawn width
 * within one pixel of its width at the default 26° from 0.1° to 90°, as WebGLRenderer and WebGPURenderer draw it. Served
 * from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/fieldOfView.html`.
 */
import { expect, test, type Page } from "@playwright/test";

const FIELDS_OF_VIEW = [0.1, 30, 45, 90];

const open = async (page: Page, backend: string) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/lib/__tests__/browser/fieldOfView.html?backend=${backend}`);
  await page.waitForFunction("window.READY === true");
  expect(await page.evaluate("T.backend()")).toBe(backend);
  return errors;
};

for (const backend of ["webgl", "webgpu"] as const) {
  for (const type of ["cube", "rounded-cube", "sphere"] as const) {
    for (const triad of [false, true]) {
      test(`${backend} ${type}${triad ? " with the triad" : ""}: face-on width within one pixel of 26° at 0.1°, 30°, 45° and 90°`, async ({ page }) => {
        test.setTimeout(120_000);
        const errors = await open(page, backend);
        const options = JSON.stringify({ type, triad: { enabled: triad } });
        const base = await page.evaluate<number>(`T.width(${options}, 26)`);
        // Not vacuous: the body fills a good part of the 400 px gizmo.
        expect(base).toBeGreaterThan(150);
        const ratios: Record<number, number> = {};
        for (const degrees of FIELDS_OF_VIEW) ratios[degrees] = (await page.evaluate<number>(`T.width(${options}, ${degrees})`)) / base;
        test.info().annotations.push({ type: "widths", description: JSON.stringify({ base, ratios }) });
        for (const degrees of FIELDS_OF_VIEW) expect(Math.abs(ratios[degrees]! - 1) * base, `${degrees}°: ${JSON.stringify(ratios)}`).toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
      });
    }
  }
}
