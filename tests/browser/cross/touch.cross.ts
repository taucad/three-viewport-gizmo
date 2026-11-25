/**
 * P13 emulated touch at phone size: WebKit as iPhone 15 (`touch-iphone`) and Chromium as Pixel 7 (`touch-android`),
 * `hasTouch` and `isMobile` from Playwright's device list. Taps use `page.touchscreen.tap`, which both engines turn
 * into a real touch sequence. A drag needs touch-move input, which Playwright offers only through Chromium's CDP
 * (`Input.dispatchTouchEvent`); WebKit has no touch-move API, so the drag case runs on Chromium only. This is emulation:
 * no real phone, real iOS Safari or real Android Chrome is exercised.
 */
import type { CDPSession, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

type State = {
  at: string | null;
  sides: Record<"up" | "right" | "down" | "left", string> | null;
  shown: string[];
  back: number[];
  animating: boolean;
  hovered: string | null;
  ends: number;
  last: { cause: string; status: string } | null;
  scrollY: number;
};
type Rect = { x: number; y: number; width: number; height: number };

const ALL = ["roll-clockwise", "up", "roll-counterclockwise", "left", "right", "down", "home"];

const open = async (page: Page, params: Record<string, string> = {}) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`/tests/browser/cross/touch.html?${new URLSearchParams({ backend: "webgl", ...params })}`);
  await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
  const T = <R = unknown>(expression: string) => page.evaluate<R>(`T.${expression}`);
  return { errors, T };
};
const centre = (r: Rect) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

test("the device reports touch media features", async ({ page }, info) => {
  const { T } = await open(page);
  const media = { hoverNone: await T<boolean>("hoverNone()"), pointerCoarse: await T<boolean>("pointerCoarse()"), userAgent: await page.evaluate("navigator.userAgent") };
  info.annotations.push({ type: "media", description: JSON.stringify(media) });
  console.log(`[${info.project.name}] media: ${JSON.stringify(media)}`);
  expect(media.pointerCoarse).toBe(true);
});

for (const type of ["cube", "rounded-cube", "sphere"] as const) {
  test(`${type}: a tap on each of the 26 targets turns to it and never hovers`, async ({ page }) => {
    test.setTimeout(120_000);
    const { errors, T } = await open(page, { type });
    const names = await T<string[]>("names()");
    expect(names).toHaveLength(26);
    const missed: string[] = [];
    for (const name of names) {
      // Apart from the last tap by more than the double-tap interval: a second tap there resets the up.
      await page.waitForTimeout(600);
      const at = await T<{ x: number; y: number }>(`aim(${JSON.stringify(name)})`);
      await page.touchscreen.tap(at.x, at.y);
      const reached = await expect
        .poll(async () => {
          const s = await T<State>("state()");
          return { animating: s.animating, at: s.at };
        }, { timeout: 5_000 })
        .toEqual({ animating: false, at: name })
        .then(() => true, () => false);
      if (!reached) missed.push(`${name} -> ${(await T<State>("state()")).at}`);
      expect((await T<State>("state()")).hovered, `touch never hovers (${name})`).toBeNull();
    }
    expect(missed).toEqual([]);
    expect((await T<State>("state()")).last).toEqual({ cause: "click", status: "reached" });
    expect(errors).toEqual([]);
  });
}

test("navigation buttons show on a touch screen and a tap on each lands", async ({ page }, info) => {
  const first = await open(page);
  const hoverNone = await first.T<boolean>("hoverNone()");
  // A touch screen has no hover, so the library reveals the buttons when `(hover: none)` matches. If the emulation
  // does not report it, the buttons are forced on and that is recorded: it is a gap of the emulation, not the library.
  info.annotations.push({ type: "hover-none", description: String(hoverNone) });
  const { errors, T } = hoverNone ? first : await open(page, { reveal: "always" });
  const tap = async (name: string) => {
    const r = await T<Rect>(`rect('${name}')`);
    expect({ name, width: r.width >= 24, height: r.height >= 24 }).toEqual({ name, width: true, height: true });
    const c = centre(r);
    await page.touchscreen.tap(c.x, c.y);
    return T<State>("settled()");
  };
  for (const side of ["up", "right", "down", "left"] as const) {
    const before = await T<State>("look('front')");
    expect(before.shown).toEqual(ALL);
    const after = await tap(side);
    expect({ side, at: after.at, last: after.last }).toEqual({ side, at: before.sides![side], last: { cause: "navigation", status: "reached" } });
  }
  await T("look('front')");
  expect(await tap("roll-clockwise")).toMatchObject({ at: "front", last: { cause: "navigation", status: "reached" } });
  expect(await tap("roll-counterclockwise")).toMatchObject({ at: "front", last: { cause: "navigation", status: "reached" } });
  await T("look('back')");
  expect(await tap("home")).toMatchObject({ at: "top-front-right", last: { cause: "navigation", status: "reached" } });
  expect(errors).toEqual([]);
});

/** One CDP touch frame; `points` are the fingers down after this event. */
const touch = (cdp: CDPSession, type: "touchStart" | "touchMove" | "touchEnd", points: { x: number; y: number; id: number }[]) =>
  cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });

test("a one-finger drag on the gizmo turns the view and does not scroll the page", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Playwright has touch-move input only through Chromium's CDP; WebKit offers tap alone");
  const { errors, T } = await open(page, { tall: "1" });
  const c = centre(await T<Rect>("rect()"));
  const before = await T<State>("state()");
  const cdp = await page.context().newCDPSession(page);
  await touch(cdp, "touchStart", [{ ...c, id: 1 }]);
  for (let i = 1; i <= 10; i++) await touch(cdp, "touchMove", [{ x: c.x - 6 * i, y: c.y + 4 * i, id: 1 }]);
  await touch(cdp, "touchEnd", []);
  await T("frames(5)");
  const after = await T<State>("state()");
  expect(dot(after.back, before.back), "the drag turned the view").toBeLessThan(0.999);
  expect(after.scrollY).toBe(0);
  expect(after.hovered).toBeNull();
  expect(errors).toEqual([]);
});
