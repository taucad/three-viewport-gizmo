/**
 * S1 browser cases: lib/scene/ build, in-place update and rebuild on a real GPU, read back from a render target.
 * Served from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/scene.html`.
 */
import { expect, test, type Page } from "@playwright/test";
import budget from "../../../perf/budget.json" with { type: "json" };

type Result = {
  backend: string;
  lit: number;
  themeChanged: boolean;
  themeClass: string | null;
  themeMs: number;
  setEqual: boolean;
  rebuildEqual: boolean;
  programsBefore: number;
  programsAfterHover: number;
  materials: number;
};

/**
 * The theme change plus the next frame, read back, in milliseconds: the budget's report row `set-next-frame` (S1).
 * A report row alarms at 3x its 2.3.0 figure and only on the reference GPU (perf audit D12); elsewhere it is printed
 * (SwiftShader: 150 to 250 ms).
 */
const THEME_FRAME_MS = 3 * (budget.rows.find((r) => r.id === "set-next-frame")!.baseline as number);

const BACKENDS = ["webgpu", "webgl"] as const;
const TYPES = ["sphere", "cube", "rounded-cube"] as const;

/** Opens scene.html for one backend and type and runs it, counting console errors and warnings. */
const run = async (page: Page, backend: string, type: string) => {
  const errors: string[] = [];
  page.on("console", (message) => (message.type() === "error" || message.type() === "warning") && !message.text().includes("GL Driver Message") && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/lib/__tests__/browser/scene.html?backend=${backend}&type=${type}`);
  await page.waitForFunction("window.READY === true");
  return { result: await page.evaluate<Result>("T.run()"), errors };
};

for (const backend of BACKENDS) {
  for (const type of TYPES) {
    test(`${backend} ${type}: set() and a rebuild keep every pixel; hovering compiles nothing`, async ({ page }) => {
      const { result, errors } = await run(page, backend, type);

      expect(result.backend).toBe(backend);
      expect(result.lit).toBeGreaterThan(0);
      expect(result.themeClass).toBe("cheap");
      expect(result.themeChanged).toBe(true);
      expect(result.setEqual).toBe(true);
      expect(result.rebuildEqual).toBe(true);
      expect(result.programsAfterHover).toBe(result.programsBefore);
      if (type === "cube") expect(result.materials).toBeLessThanOrEqual(16);
      console.log(`[report] ${backend} ${type} theme change plus next frame: ${result.themeMs.toFixed(1)} ms (budget ${THEME_FRAME_MS} on metal)`);
      expect(errors).toEqual([]);
    });
  }
}

/**
 * The timing alarm on its own, so a slower GPU than the reference Mac (a CI runner's paravirtual Metal) reads as a
 * timing miss, apart from the functional cases above. It runs only where the project's GPU is `metal`.
 */
test("set-next-frame report row: a theme change plus the next frame stays within 3x its baseline on metal", async ({ page }) => {
  test.skip(test.info().project.metadata.gpu !== "metal", "The report row alarms only on the reference GPU (perf audit D12)");
  test.setTimeout(180_000);
  const times: Record<string, number> = {};
  for (const backend of BACKENDS) {
    for (const type of TYPES) times[`${backend} ${type}`] = (await run(page, backend, type)).result.themeMs;
  }
  // Compared raw, as the per-case check did (`toBeLessThan`); rounded only for the report.
  const shown = (entries: [string, number][]) => Object.fromEntries(entries.map(([k, ms]) => [k, +ms.toFixed(1)]));
  test.info().annotations.push({ type: "measured", description: JSON.stringify(shown(Object.entries(times))) });
  const over = shown(Object.entries(times).filter(([, ms]) => ms >= THEME_FRAME_MS));
  expect(over, `budget ${THEME_FRAME_MS} ms`).toEqual({});
});
