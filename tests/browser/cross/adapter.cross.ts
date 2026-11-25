/**
 * P13 adapter probe: records what each browser gives the gizmo to draw with (WebGL 2 renderer string, WebGPU adapter
 * name and whether it is a fallback adapter, and whether three's WebGPURenderer lands on the WebGPU backend). It
 * asserts only that WebGL 2 exists; the WebGPU facts are evidence, written to `adapter.json` and the job summary.
 */
import { writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

test("adapter probe: WebGL 2 renderer and WebGPU adapter", async ({ page, browserName, browser }, info) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/tests/browser/cross/probe.html");
  await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
  const probe = await page.evaluate<Record<string, unknown>>("P.probe()");
  const record = { browserName, browserVersion: browser.version(), project: info.project.name, ...probe, consoleErrors: errors };
  const json = JSON.stringify(record, null, 2);
  console.log(`[adapter ${browserName}] ${json}`);
  info.annotations.push({ type: "adapter", description: JSON.stringify(record) });
  writeFileSync(info.outputPath("adapter.json"), json);
  await info.attach("adapter.json", { body: json, contentType: "application/json" });
  expect(probe.webgl2, "WebGL 2 is available").not.toBeNull();
});
