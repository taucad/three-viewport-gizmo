/**
 * P13 automated accessibility: axe-core scans (WCAG 2.0–2.2 A and AA plus best practice) of the built docs site and of
 * the gizmo on its own test pages. The test pages are harnesses, so they are scanned only inside the gizmo's element;
 * the docs pages are scanned whole. axe-core is not a dependency of the package: the workflow installs it with
 * `npm install --no-save axe-core`, and the case skips when it is absent. Violations are written to `axe.json` and the
 * job summary, by rule.
 */
import { existsSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";
import { sitePort } from "../cross.config";

type Violation = { id: string; impact: string | null; help: string; helpUrl: string; nodes: { target: string[]; failureSummary?: string }[] };

const axePath = (() => {
  try {
    return createRequire(import.meta.url).resolve("axe-core/axe.min.js");
  } catch {
    return null;
  }
})();
const site = existsSync(new URL("../../../site/out/index.html", import.meta.url));
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

const scan = async (page: Page, include?: string) => {
  await page.addScriptTag({ path: axePath! });
  const options = JSON.stringify({ runOnly: { type: "tag", values: tags }, resultTypes: ["violations", "incomplete"] });
  const context = include ? JSON.stringify({ include: [include] }) : "document";
  return page.evaluate<{ violations: Violation[]; incomplete: Violation[]; passes: unknown[]; testEngine: { version: string } }>(
    `axe.run(${context}, ${options})`
  );
};

const record = (info: import("@playwright/test").TestInfo, page: string, result: { violations: Violation[]; incomplete: Violation[]; testEngine: { version: string } }) => {
  const summary = {
    page,
    axe: result.testEngine.version,
    violations: result.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, first: v.nodes[0]?.failureSummary, nodes: v.nodes.map((n) => n.target.join(" ")) })),
    incomplete: result.incomplete.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
  };
  const json = JSON.stringify(summary, null, 2);
  writeFileSync(info.outputPath("axe.json"), json);
  info.annotations.push({ type: "axe", description: JSON.stringify(summary) });
  console.log(`[axe] ${json}`);
  return summary;
};

const gizmoPages = [
  ["keyboard page, view cube", "/lib/__tests__/browser/keyboard.html?backend=webgl"],
  ["keyboard page, view sphere", "/lib/__tests__/browser/keyboard.html?backend=webgl&type=sphere"],
  ["navigation page, buttons shown", "/lib/__tests__/browser/navigation.html?backend=webgl&reveal=always"],
  ["navigation page, Tau's cube with the triad", "/lib/__tests__/browser/navigation.html?backend=webgl&reveal=always&type=cube&size=96&triad=true"],
] as const;

for (const [title, path] of gizmoPages) {
  test(`axe: the gizmo on the ${title}`, async ({ page }, info) => {
    test.skip(!axePath, "npm install --no-save axe-core first");
    await page.goto(path);
    await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
    // Scanned at rest and with a view reached by key, so the name and status child are written.
    await page.evaluate("T.look('front')");
    const summary = record(info, title, await scan(page, "[role=application]"));
    expect(summary.violations).toEqual([]);
  });
}

/** Each docs page and the live example gizmos it mounts after hydration (`role="application"`, one per example). */
const sitePages = [
  { path: "/", gizmos: 1 },
  { path: "/playground/", gizmos: 1 },
  { path: "/docs/", gizmos: 0 },
  { path: "/docs/keyboard/", gizmos: 1 },
  { path: "/docs/navigation/", gizmos: 3 },
  { path: "/docs/quickstart/", gizmos: 1 },
] as const;

for (const { path, gizmos } of sitePages) for (const scheme of ["light", "dark"] as const) {
  test(`axe: docs site ${path}${scheme === "dark" ? " (dark)" : ""}`, async ({ page }, info) => {
    test.skip(!axePath, "npm install --no-save axe-core first");
    test.skip(!site, "Build the docs site first (:docs writes site/out)");
    // The code blocks take one of two Shiki themes per colour scheme, so both are scanned.
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(`http://127.0.0.1:${sitePort}/three-viewport-gizmo${path}`);
    await page.waitForLoadState("networkidle");
    if (gizmos > 0) {
      // Live examples mount their gizmo after hydration: scan only once every one is there, visible and named, and no
      // stage is still starting its renderer (`aria-busy`).
      const live = page.getByRole("application");
      await expect(live).toHaveCount(gizmos, { timeout: 30_000 });
      await expect(page.locator("[aria-busy=true]")).toHaveCount(0, { timeout: 30_000 });
      for (const gizmo of await live.all()) {
        await expect(gizmo).toBeVisible();
        await expect(gizmo).toHaveAttribute("aria-label", /\S/);
      }
    }
    const summary = record(info, `site ${path} (${scheme})`, await scan(page));
    await expect(page.getByRole("application")).toHaveCount(gizmos);
    expect(summary.violations).toEqual([]);
  });
}
