/**
 * P13 accessibility tree, in every engine: the gizmo is a focusable `application` with a role description, its
 * accessible name follows the view after a key, and its `status` child announces a reached key turn and nothing for a
 * pointer turn. Playwright's role queries and `ariaSnapshot()` compute the tree the same way in each engine; on
 * Chromium the browser's own tree is read too, through CDP `Accessibility.getPartialAXTree`.
 */
import { expect, test, type Page } from "@playwright/test";

type Target = { name: string; label: string };
type AXNode = { role?: { value?: string }; name?: { value?: string }; properties?: { name: string; value: { value?: unknown } }[]; ignored?: boolean };

const open = async (page: Page, query: string) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(query);
  await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
  return errors;
};

/** Presses a key and waits for the turn it starts to settle. */
const key = async (page: Page, k: string) => {
  await page.keyboard.press(k);
  return page.evaluate<{ at: string }>("T.settled()");
};

/** Chromium's own accessibility node for the first element matching `selector`. */
const chromiumNode = async (page: Page, selector: string) => {
  const cdp = await page.context().newCDPSession(page);
  const { root } = (await cdp.send("DOM.getDocument", { depth: 0 })) as { root: { nodeId: number } };
  const { nodeId } = (await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector })) as { nodeId: number };
  const { nodes } = (await cdp.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false })) as { nodes: AXNode[] };
  const node = nodes[0];
  const props = Object.fromEntries((node.properties ?? []).map((p) => [p.name, p.value.value]));
  return { role: node.role?.value, name: node.name?.value, ignored: node.ignored, ...props };
};

test("the view cube: application, role description, name after a key, status announcement", async ({ page, browserName }, info) => {
  const errors = await open(page, "/lib/__tests__/browser/keyboard.html?backend=webgl");
  const targets = await page.evaluate<Target[]>("T.targets");
  const label = (n: string) => targets.find((t) => t.name === n)!.label;
  const gizmo = page.getByRole("application");
  await expect(gizmo).toHaveCount(1);
  await expect(gizmo).toHaveAttribute("aria-roledescription", "view cube");
  await expect(gizmo).toHaveAttribute("tabindex", "0");
  const status = gizmo.getByRole("status");
  await expect(status).toHaveCount(1);
  await expect(status).toHaveText("");

  // Tab reaches it; a digit turns to a face; the name and then the status read that face.
  await page.focus("#before");
  await page.keyboard.press("Tab");
  await expect(gizmo).toBeFocused();
  await key(page, "Digit1");
  await expect(gizmo).toHaveAccessibleName(label("front"));
  await expect(status).toHaveText(label("front"));
  await expect(page.getByRole("application", { name: label("front") })).toHaveCount(1);

  // A roll is part of the name and is announced again.
  await key(page, "Shift+ArrowRight");
  const rolled = `${label("front")}, rolled 90° clockwise`;
  await expect(gizmo).toHaveAccessibleName(rolled);
  await expect(status).toHaveText(rolled);
  // An arrow to a neighbour renames it to that neighbour.
  await key(page, "Shift+ArrowLeft");
  await expect(gizmo).toHaveAccessibleName(label("front"));
  const up = await key(page, "ArrowUp");
  await expect(gizmo).toHaveAccessibleName(label(up.at));
  await expect(status).toHaveText(label(up.at));

  const snapshot = await gizmo.ariaSnapshot();
  info.annotations.push({ type: "aria-snapshot", description: snapshot });
  console.log(`[${browserName}] aria snapshot:\n${snapshot}`);

  if (browserName === "chromium") {
    const node = await chromiumNode(page, "[role=application]");
    const live = await chromiumNode(page, "[role=application] > [role=status]");
    info.annotations.push({ type: "chromium-ax", description: JSON.stringify({ node, live }) });
    console.log(`[chromium] AX application: ${JSON.stringify(node)}\n[chromium] AX status: ${JSON.stringify(live)}`);
    expect(node).toMatchObject({ role: "application", name: label(up.at), roledescription: "view cube", focusable: true });
    expect(live).toMatchObject({ role: "status", live: "polite", atomic: true });
  }
  expect(errors).toEqual([]);
});

test("a pointer turn renames the view and announces nothing", async ({ page }) => {
  const errors = await open(page, "/lib/__tests__/browser/keyboard.html?backend=webgl");
  const gizmo = page.getByRole("application");
  const r = await page.evaluate<{ x: number; y: number; width: number; height: number }>("T.rect()");
  await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
  const s = await page.evaluate<{ at: string | null; name: string; last: { cause: string } }>("T.settled()");
  expect(s.last.cause).toBe("click");
  const label = await page.evaluate<string>(`T.targets.find((t) => t.name === ${JSON.stringify(s.at)}).label`);
  await expect(gizmo).toHaveAccessibleName(label);
  await page.waitForTimeout(200);
  await expect(gizmo.getByRole("status")).toHaveText("");
  expect(errors).toEqual([]);
});

test("the view sphere names its role description; disabled leaves the tab order", async ({ page }) => {
  const errors = await open(page, "/lib/__tests__/browser/keyboard.html?backend=webgl&type=sphere");
  const gizmo = page.getByRole("application");
  await expect(gizmo).toHaveAttribute("aria-roledescription", "view sphere");
  await page.evaluate("T.disable(true)");
  await expect(gizmo).toHaveAttribute("aria-disabled", "true");
  await expect(gizmo).toHaveAttribute("tabindex", "-1");
  await expect(gizmo).toBeDisabled();
  expect(errors).toEqual([]);
});

test("navigation buttons are named buttons in the tab order", async ({ page }) => {
  const errors = await open(page, "/lib/__tests__/browser/navigation.html?backend=webgl");
  await page.evaluate("T.look('front')");
  await page.focus("#before");
  await page.keyboard.press("Tab");
  const gizmo = page.getByRole("application");
  await expect(gizmo).toBeFocused();
  const names: string[] = [];
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveRole("button");
    names.push((await focused.getAttribute("aria-label")) ?? "");
  }
  const sides = await page.evaluate<Record<string, string>>(
    "Object.fromEntries(Object.entries(T.state().sides).map(([k, n]) => [k, T.target(n).label]))"
  );
  expect(names).toEqual([
    "Roll view clockwise",
    `Turn to ${sides.up}`,
    "Roll view counter-clockwise",
    `Turn to ${sides.left}`,
    `Turn to ${sides.right}`,
    `Turn to ${sides.down}`,
    "Home view",
  ]);
  // Every button's name is what a screen reader says for it, and its icon is hidden from the tree.
  for (const name of names) await expect(gizmo.getByRole("button", { name, exact: true })).toHaveCount(1);
  await expect(gizmo.locator("svg:not([aria-hidden=true])")).toHaveCount(0);
  expect(errors).toEqual([]);
});
