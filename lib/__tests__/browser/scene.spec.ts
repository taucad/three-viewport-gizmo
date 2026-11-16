/**
 * S1 browser cases: lib/scene/ build, in-place update and rebuild on a real GPU, read back from a render target.
 * Served from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/scene.html`.
 */
import { expect, test } from "@playwright/test";

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
 * The theme change plus the next frame, read back, in milliseconds: S1's row of the report's budget table.
 * A timing, so it blocks only on the reference GPU (perf audit D12); elsewhere it is printed (SwiftShader: 150 to 250 ms).
 */
const THEME_FRAME_MS = 150;

for (const backend of ["webgpu", "webgl"] as const) {
  for (const type of ["sphere", "cube", "rounded-cube"] as const) {
    test(`${backend} ${type}: set() and a rebuild keep every pixel; hovering compiles nothing`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`/lib/__tests__/browser/scene.html?backend=${backend}&type=${type}`);
      await page.waitForFunction("window.READY === true");
      const result = await page.evaluate<Result>("T.run()");

      expect(result.backend).toBe(backend);
      expect(result.lit).toBeGreaterThan(0);
      expect(result.themeClass).toBe("cheap");
      expect(result.themeChanged).toBe(true);
      expect(result.setEqual).toBe(true);
      expect(result.rebuildEqual).toBe(true);
      expect(result.programsAfterHover).toBe(result.programsBefore);
      if (type === "cube") expect(result.materials).toBeLessThanOrEqual(16);
      if (test.info().project.metadata.gpu === "metal") expect(result.themeMs).toBeLessThan(THEME_FRAME_MS);
      else console.log(`[report] ${backend} ${type} theme change plus next frame: ${result.themeMs.toFixed(1)} ms (budget ${THEME_FRAME_MS} on metal)`);
      expect(errors).toEqual([]);
    });
  }
}
