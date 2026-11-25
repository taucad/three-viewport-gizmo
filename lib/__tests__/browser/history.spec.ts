/**
 * A gizmo frame is a function of the camera pose and the options only: the first frame back at a pose, after frames at
 * other poses, matches the frame drawn there before to the byte, triad on, on WebGL and WebGPU (Tau's 5K section
 * picker case). Served from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/history.html`.
 *
 * On `WebGPURenderer` before three r186 this also needs three's own fix: its `NodeMaterialObserver` could skip an
 * object's transform after the draw order changed, drawing it where a previous frame had it (fixed in r186).
 */
import { expect, test, type Page } from "@playwright/test";

type RoundTrips = { returns: { from: number[]; differ: number }[]; drawn: boolean };

/**
 * Tau's home view, where the X and Z lines sit at the same depth: from `lookAt`, and at the exact orientation Tau's
 * packaged camera has (it rounds differently). Before the fix the first broke on WebGL and the second on WebGPU.
 */
const HOMES = [
  [1, -1, 1],
  [1, -1, 1, 0.424708200277867, 0.17591989660616122, 0.3398511429799874, 0.8204732385702832],
];
/** Tau's round trip: through the poses either side of home, end-on to an axis and below the cube. */
const AWAY = [
  [1, -0.3, 1],
  [1, 0.7, 1],
  [1, 1, 3],
  [-1, 1, 1],
  [3, 1, 1],
  [1, -1, -1],
  [1, 1, 1, 0.1759198966061612, 0.4247082002778668, 0.8204732385702833, 0.33985114297998736],
  [1, -3, 1],
  [0, 0, 1],
];

const open = async (page: Page, backend: string) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/lib/__tests__/browser/history.html?backend=${backend}&dpr=2`);
  await page.waitForFunction("window.READY === true");
  expect(await page.evaluate("T.backend()")).toBe(backend);
  return errors;
};

for (const backend of ["webgl", "webgpu"] as const) {
  for (const type of ["cube", "rounded-cube"] as const) {
    test(`${backend} ${type} with the triad: the first frame back at a pose is the frame drawn there before`, async ({ page }) => {
      const errors = await open(page, backend);
      const options = { type, triad: { enabled: true } };
      for (const home of HOMES) {
        const result = await page.evaluate<RoundTrips>(`T.roundTrips(${JSON.stringify(options)}, ${JSON.stringify(home)}, ${JSON.stringify(AWAY)})`);
        expect(result.drawn).toBe(true);
        expect(result.returns.filter((r) => r.differ !== 0), `home ${home}`).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
  }
}
