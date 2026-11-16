/**
 * Screenshot matrix scaffold: gizmo type × up axis × backend (the backend is the project).
 * Each cell captures the gizmo's rectangle and attaches it; H1 turns the attachments into
 * committed references (`toHaveScreenshot`). Negative up axes do not exist in 2.3.0.
 */
import { expect, test } from "./fixtures";

const types = ["sphere", "cube", "rounded-cube"] as const;
const ups = ["+x", "-x", "+y", "-y", "+z", "-z"] as const;

for (const type of types) {
  for (const up of ups) {
    test(`matrix ${type} up ${up}`, async ({ open }, info) => {
      test.fixme(up.startsWith("-"), "O1: 2.3.0 accepts only x, y and z as up");
      const { P, page, errors } = await open({ type, up: up.slice(1) });
      await P("step('make')");
      const lit = await P<number>("render3()");
      const rect = await P<{ x: number; y: number; width: number; height: number }>("rect()");
      await info.attach(`${info.project.name}-${type}-up${up}.png`, { body: await page.screenshot({ clip: rect }), contentType: "image/png" });
      expect(lit).toBeGreaterThan(1000);
      expect(errors).toEqual([]);
    });
  }
}
