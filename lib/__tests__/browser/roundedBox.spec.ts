/**
 * S5 browser cases: the seamless rounded cube on a real GPU, looking from each of its 26 targets.
 * Served from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/roundedBox.html`.
 */
import { expect, test } from "@playwright/test";

type View = {
  name: string;
  /** Pixels where the box's red inside shows through its pieces: seams. */
  red: number;
  /** Bytes that differ from the one merged mesh. */
  differ: number;
  /** Pixels of the hovered piece, and of all pixels that hovering it changed, those outside it. */
  mask: number;
  changed: number;
  outside: number;
  /** Pixels a pixel away from any piece boundary, and those the analytic hit test names differently. */
  interior: number;
  disagree: number;
};

for (const backend of ["webgpu", "webgl"] as const) {
  test(`${backend} rounded-cube: no seam at any of the 26 views; hover lights the piece the hit test names`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/lib/__tests__/browser/roundedBox.html?backend=${backend}`);
    await page.waitForFunction("window.READY === true");
    const result = await page.evaluate<{ backend: string; triangles: number; views: View[] }>("T.run()");

    expect(result.backend).toBe(backend);
    expect(result.triangles).toBeLessThanOrEqual(15_000);
    expect(result.views).toHaveLength(26);
    for (const view of result.views) {
      expect(view.red, view.name).toBe(0);
      expect(view.differ, view.name).toBe(0);
      expect(view.mask, view.name).toBeGreaterThan(0);
      expect(view.outside, view.name).toBe(0);
      // Label pixels keep their colour on hover; the rest of the piece changes.
      expect(view.changed, view.name).toBeGreaterThan(view.mask / 2);
      expect(view.disagree, view.name).toBe(0);
    }
    expect(errors).toEqual([]);
  });
}
