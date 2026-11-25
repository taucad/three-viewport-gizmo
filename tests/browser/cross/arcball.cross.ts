/**
 * P13 triage probe for views.spec.ts "arcball: a real drag after a roll keeps working from the rolled view", which
 * fails on Playwright WebKit (Linux) only. It replays that case's steps on views.html and records whether the camera
 * still moves with no input after the host drag (ArcballControls' own animation), and what a later gizmo click
 * reaches, frame by frame. Evidence only: it asserts that the page loads.
 */
import { expect, test } from "@playwright/test";

type State = { back: number[] };

test("arcball: camera motion after a host drag, and the gizmo click that follows", async ({ page, browserName }, info) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
  await page.goto("/tests/browser/views.html?backend=webgl&type=cube&controls=arcball");
  await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
  const T = <R = unknown>(e: string) => page.evaluate<R>(`T.${e}`);
  await T("lookFrom('front', { animated: false, up: 'reset' })");
  await T("hostRoll()");
  await T("frames(5)");
  await page.mouse.move(250, 300);
  await page.mouse.down();
  await page.mouse.move(330, 300, { steps: 10 });
  await page.mouse.up();
  const drift: number[] = [];
  let last = (await T<State>("state()")).back;
  for (let i = 0; i < 6; i++) {
    await T("frames(10)");
    const now = (await T<State>("state()")).back;
    drift.push(Math.acos(Math.min(1, last.reduce((s, x, j) => s + x * now[j], 0))) * (180 / Math.PI));
    last = now;
  }
  const near = await T<{ x: number; y: number }>("aim('front', 'keep')");
  await page.mouse.click(near.x, near.y);
  const after: { at: string | null; animating: boolean }[] = [];
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(300);
    after.push({ at: await T("at()"), animating: await T("animating()") });
  }
  const record = { browserName, driftDegreesPer10Frames: drift.map((d) => +d.toFixed(3)), afterClick: after, errors };
  info.annotations.push({ type: "arcball", description: JSON.stringify(record) });
  console.log(`[arcball ${browserName}] ${JSON.stringify(record)}`);
  expect(drift).toHaveLength(6);
});
