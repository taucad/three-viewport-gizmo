#!/usr/bin/env node
/**
 * P13 real Safari smoke through safaridriver (W3C WebDriver), for a macOS runner. Playwright cannot drive Safari
 * itself, only its own WebKit build, so this script speaks WebDriver with `fetch` and needs no dependency.
 *
 * It serves the browser gate's pages with the gate's Vite config, then in Safari, on WebGL and (when Safari offers an
 * adapter) WebGPU: records the adapter probe, clicks all 26 targets of each gizmo type with WebDriver pointer actions
 * (views.html), runs the keyboard map's digits, Home, an arrow and a roll and reads the accessible name and status
 * child (keyboard.html), and presses the navigation buttons (navigation.html).
 *
 * Usage (macOS, once per machine: `sudo safaridriver --enable`):
 *   node tests/browser/cross/safari.mjs
 * `--serve-only` starts and checks the Vite server, then stops before safaridriver (any OS).
 * Env: GIZMO_GATE_PORT (Vite, default 4179), SAFARIDRIVER_PORT (default 4444), SAFARI_OUT (default
 * test-results/cross/safari). Exits 1 when any check fails; the results are in `$SAFARI_OUT/safari.json`.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const port = Number(process.env.GIZMO_GATE_PORT ?? 4179);
const driverPort = Number(process.env.SAFARIDRIVER_PORT ?? 4444);
const out = process.env.SAFARI_OUT ?? `${root}/test-results/cross/safari`;
const base = `http://127.0.0.1:${port}`;
const driver = `http://127.0.0.1:${driverPort}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const children = [];
/** Whether anything answers HTTP on `url`'s origin, whatever the status. */
const answers = async (url) => {
  try {
    await fetch(new URL("/", url));
    return true;
  } catch {
    return false;
  }
};
const waitFor = async (url, what, ms = 60_000) => {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error(`${what} did not answer at ${url} within ${ms} ms`);
};
/**
 * Starts a server and resolves once `url` answers. Refuses a port something else already serves (its pages would be
 * taken for ours), and rejects as soon as the child exits or fails to spawn before it is ready, with its output's tail.
 */
const serve = async (what, command, args, url) => {
  if (await answers(url)) {
    throw new Error(`${what}: ${new URL(url).host} is already served by another process; stop it or pick another port (GIZMO_GATE_PORT, SAFARIDRIVER_PORT)`);
  }
  const child = spawn(command, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  children.push(child);
  let tail = "";
  const keep = (stream, sink) =>
    stream.on("data", (chunk) => {
      sink.write(chunk);
      tail = (tail + chunk).slice(-2_000);
    });
  keep(child.stdout, process.stdout);
  keep(child.stderr, process.stderr);
  const died = new Promise((_, reject) => {
    child.once("error", (error) => reject(new Error(`${what} could not start (${command}): ${error.message}`)));
    child.once("exit", (code, signal) => reject(new Error(`${what} exited (${signal ?? `code ${code}`}) before ${url} answered:\n${tail.trim()}`)));
  });
  try {
    await Promise.race([waitFor(url, what), died]);
  } finally {
    died.catch(() => {}); // the child's later exit (killed at the end) is not an error
  }
};

/** One WebDriver command; throws with WebDriver's error on failure. */
const wd = async (method, path, body) => {
  const response = await fetch(`${driver}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(`${method} ${path}: ${json.value?.error}: ${json.value?.message}`);
  return json.value;
};

let session;
const exec = (script, ...args) => wd("POST", `/session/${session}/execute/sync`, { script, args });
const actions = async (list) => {
  await wd("POST", `/session/${session}/actions`, { actions: list });
  await wd("DELETE", `/session/${session}/actions`);
};
const pointer = (steps) => ({ type: "pointer", id: "mouse", parameters: { pointerType: "mouse" }, actions: steps });
const move = (x, y, duration = 0) => ({ type: "pointerMove", origin: "viewport", x: Math.round(x), y: Math.round(y), duration });
const click = (x, y) => actions([pointer([move(x, y, 50), { type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }])]);
const KEYS = { Tab: "", Home: "", ArrowLeft: "", ArrowUp: "", ArrowRight: "", ArrowDown: "", Shift: "", Enter: "" };
const press = (...keys) =>
  actions([
    {
      type: "key",
      id: "keyboard",
      actions: [...keys.map((k) => ({ type: "keyDown", value: KEYS[k] ?? k })), ...keys.reverse().map((k) => ({ type: "keyUp", value: KEYS[k] ?? k }))],
    },
  ]);

const open = async (path) => {
  await wd("POST", `/session/${session}/url`, { url: `${base}${path}` });
  const until = Date.now() + 30_000;
  while (Date.now() < until) {
    if (await exec("return window.READY === true")) return;
    await sleep(200);
  }
  throw new Error(`${path}: window.READY never set`);
};
const poll = async (script, predicate, ms = 5_000) => {
  const until = Date.now() + ms;
  let value;
  while (Date.now() < until) {
    value = await exec(script);
    if (predicate(value)) return { ok: true, value };
    await sleep(50);
  }
  return { ok: false, value };
};

const results = { safari: null, probe: null, checks: [] };
const check = (name, ok, detail) => {
  results.checks.push({ name, ok, ...(detail === undefined ? {} : { detail }) });
  console.log(`${ok ? "pass" : "FAIL"}  ${name}${ok || detail === undefined ? "" : `  ${JSON.stringify(detail)}`}`);
};
/** A failure that is a recorded engine bug, not the gizmo's: neither passed nor failed, listed apart with its note. */
const known = (name, note, detail) => {
  results.checks.push({ name, ok: "known", known: note, detail });
  console.log(`known  ${name}  (${note})`);
};
/** A check the driver cannot exercise: recorded with its reason, neither passed nor failed. */
const block = (name, reason) => {
  results.checks.push({ name, ok: null, blocked: reason });
  console.log(`blocked  ${name}  (${reason})`);
};

const views = async (backend, type) => {
  await open(`/tests/browser/views.html?backend=${backend}&type=${type}&controls=orbit`);
  const names = await exec("return T.names()");
  const missed = [];
  for (const name of names) {
    await sleep(600); // apart from the last click by more than the double-click interval
    const at = await exec("return T.aim(arguments[0])", name);
    // Arrive from outside the element, so the hover is a real enter, then press and release.
    await actions([pointer([move(at.x - 200, at.y), move(at.x, at.y, 100), { type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }])]);
    const r = await poll("return { at: T.at(), animating: T.animating() }", (v) => !v.animating && v.at === name);
    if (!r.ok) missed.push(`${name} -> ${r.value.at}`);
  }
  check(`${backend} ${type}: a click on each of the 26 targets turns to it`, missed.length === 0 && names.length === 26, { targets: names.length, missed });
};

const keyboard = async (backend) => {
  await open(`/lib/__tests__/browser/keyboard.html?backend=${backend}`);
  const targets = await exec("return T.targets");
  const label = (n) => targets.find((t) => t.name === n).label;
  const state = () => exec("return T.settled()");
  await exec("document.getElementById('before').focus()");
  await press("Tab");
  const tabbed = await exec("return T.state()");
  // Safari's Tab skips everything but form fields unless "Press Tab to highlight each item" is on; record, then focus.
  check(`${backend} keyboard: Tab from the button before reaches the gizmo`, tabbed.focused === "gizmo", { focused: tabbed.focused, role: tabbed.role, tabIndex: tabbed.tabIndex });
  if (tabbed.focused !== "gizmo") await exec("T.focus()");
  const digits = [];
  for (const [i, face] of ["front", "back", "left", "right", "top", "bottom"].entries()) {
    await exec("return T.look('top-front-right')");
    await press(String(i + 1));
    const s = await state();
    if (s.at !== face || s.name !== label(face) || s.last?.cause !== "key") digits.push({ key: i + 1, face, at: s.at, name: s.name, last: s.last });
  }
  check(`${backend} keyboard: digits 1-6 reach their faces and name them`, digits.length === 0, digits);
  await exec("return T.look('front')");
  await press("Home");
  const home = await state();
  check(`${backend} keyboard: Home reaches top-front-right`, home.at === "top-front-right", { at: home.at });
  await exec("return T.look('front')");
  // Every keydown the page sees, so a miss tells a WebDriver key problem from a library one.
  await exec(`window.__keys = []; document.addEventListener("keydown", (e) => __keys.push({ key: e.key, code: e.code, shift: e.shiftKey, prevented: e.defaultPrevented, target: e.target.getAttribute?.("role") ?? e.target.tagName }), true);`);
  await press("Shift", "ArrowRight");
  const rolled = await state();
  const name = `${label("front")}, rolled 90° clockwise`;
  const keys = await exec("return __keys");
  // safaridriver 27 delivers the arrow keys with `key` "\u001d"-style control characters (the classic Mac arrow
  // codes) while `code` is right, so no `key`-based binding can see them through WebDriver. A person's arrow key in
  // Safari reads `key` "ArrowRight" (the VoiceOver job presses real macOS keys into WebKit). Those checks are then
  // recorded as blocked by the driver, not as failures.
  const arrow = keys.find((k) => k.code === "ArrowRight");
  if (arrow && arrow.key !== "ArrowRight") {
    const reason = `safaridriver sent code ${arrow.code} with key ${JSON.stringify(arrow.key)}`;
    for (const what of ["Shift+Right rolls and names the roll", "the status child announces the roll", "ArrowRight from front moves to a target"]) {
      block(`${backend} keyboard: ${what}`, reason);
    }
    return;
  }
  check(`${backend} keyboard: Shift+Right rolls and names the roll`, rolled.at === "front" && rolled.name === name, { at: rolled.at, name: rolled.name, keys });
  const announced = await poll("return T.state().status", (v) => v === name, 2_000);
  check(`${backend} keyboard: the status child announces the roll`, announced.ok, { status: announced.value });
  await exec("return T.look('front')");
  await exec("T.mark()");
  await press("ArrowRight");
  const right = await state();
  check(`${backend} keyboard: ArrowRight from front moves to a target`, right.at !== null && right.at !== "front" && right.name === label(right.at), { at: right.at, name: right.name });
};

const navigation = async (backend) => {
  await open(`/lib/__tests__/browser/navigation.html?backend=${backend}`);
  const centre = (r) => [r.x + r.width / 2, r.y + r.height / 2];
  const failures = [];
  for (const side of ["up", "right", "down", "left"]) {
    const before = await exec("return T.look('front')");
    const [gx, gy] = centre(await exec("return T.rect('')"));
    await actions([pointer([move(gx, gy, 50)])]);
    const shown = await poll("return T.state().shown", (v) => v.length === 7, 2_000);
    if (!shown.ok) failures.push({ side, shown: shown.value });
    const [x, y] = centre(await exec("return T.rect(arguments[0])", side));
    await click(x, y);
    const after = await exec("return T.settled()");
    if (after.at !== before.sides[side] || after.last?.cause !== "navigation") failures.push({ side, expected: before.sides[side], at: after.at, last: after.last });
  }
  await exec("return T.look('back')");
  const [gx, gy] = centre(await exec("return T.rect('')"));
  await actions([pointer([move(gx, gy, 50)])]);
  await poll("return T.state().shown", (v) => v.includes("home"), 2_000);
  const [hx, hy] = centre(await exec("return T.rect('home')"));
  await click(hx, hy);
  const home = await exec("return T.settled()");
  if (home.at !== "top-front-right") failures.push({ button: "home", at: home.at });
  check(`${backend} navigation: hover reveals the buttons; each side and Home lands`, failures.length === 0, failures);
};

/**
 * WebKit draws a face added through the FontFace API with the fallback in a 2D canvas while measuring with it (Safari
 * 27.2; repro: webkit-fontface-canvas.html). The late-font trace shows it when, at the final draw, the label canvas
 * measures the face (its width differs from the fallback's) yet a fresh canvas's fillText matches the fallback.
 */
const FONTFACE_CANVAS_BUG = "WebKit: FontFace API face drawn with fallback in 2D canvas";
const isFontFaceCanvasBug = (late) => {
  const faces = late?.trace?.find((t) => t.step === "draw")?.faces;
  const { font, serif } = faces?.label ?? {};
  return late?.frames === 1 && typeof font === "number" && typeof serif === "number" && font !== serif && faces.drawn?.font === false;
};

/**
 * The late web font cases (labels.spec.ts R25): a FontFace the page adds and loads, and a CSS `@font-face` family the
 * labels start loading (the usual app path); plus when Safari fires `loadingdone` for an added and loaded FontFace.
 */
const NEUTRALIZED = "canvas readback neutralized in Safari automation";
const fonts = async (backend) => {
  // Controls first (T.readback()): the font checks read "no change" through toDataURL (the 2D text pair) and the
  // renderer's target readback (`changed`). Where a channel cannot tell plainly different images apart, a check that
  // reads through it is inconclusive: blocked, not known or failed.
  await open(`/lib/__tests__/browser/labels.html?backend=${backend}`);
  const controls = await exec("return T.readback()");
  results.readback = { ...results.readback, [backend]: controls };
  console.log(`readback controls (${backend}): ${JSON.stringify(controls)}`);
  const dataUrlReads = controls.text?.toDataURL === true && controls.fill?.toDataURL === true;
  const targetReads = controls.renderTarget?.differs === true;
  const controlsName = `${backend} readback: controls tell black from white, AAAA from WWWW, and red from blue`;
  if (dataUrlReads && targetReads) check(controlsName, true);
  else block(controlsName, `${NEUTRALIZED}: ${JSON.stringify(controls)}`);

  await open(`/lib/__tests__/browser/labels.html?backend=${backend}`);
  const late = await exec("return T.lateFont()");
  const lateName = `${backend} labels: a font loaded after construction appears with no set()`;
  const lateOk = late.changed === true && late.frames === 1;
  if (!lateOk && !(dataUrlReads && targetReads)) block(lateName, `${NEUTRALIZED}; result ${JSON.stringify(late)}`);
  else if (!lateOk && isFontFaceCanvasBug(late)) known(lateName, FONTFACE_CANVAS_BUG, late);
  else check(lateName, lateOk, late);
  await open(`/lib/__tests__/browser/labels.html?backend=${backend}`);
  const css = await exec("return T.cssFont()");
  const cssName = `${backend} labels: a CSS @font-face family the labels start loading appears with no set()`;
  const cssOk = css.loaded === true && css.redrawn === true && css.frames === 1;
  if (!cssOk && !dataUrlReads) block(cssName, `${NEUTRALIZED}; result ${JSON.stringify(css)}`);
  else check(cssName, cssOk, css);
  console.log(`css font trace: ${JSON.stringify(css.trace)}`);
  const events = await exec(`
    const events = [], t0 = performance.now();
    for (const type of ["loading", "loadingdone", "loadingerror"]) document.fonts.addEventListener(type, () => events.push({ type, at: Math.round(performance.now() - t0) }));
    const face = new FontFace("P13SafariFont", "url(/tests/browser/fixtures/geist-latin.woff2)", { weight: "100 900" });
    document.fonts.add(face);
    // loadedAt is when the load resolves; the 2 s after it only watch for a late loadingdone.
    return face.load().then(() => {
      const loadedAt = Math.round(performance.now() - t0);
      return new Promise((r) => setTimeout(() => r({ loadedAt, events }), 2000));
    });
  `);
  console.log(`fonts: ${JSON.stringify(events)}`);
  results.fonts = events;
};

let failed = false;
try {
  // Vite's own bin, not `npx vite`: npx runs it as a grandchild that killing npx would leave serving the port.
  const vite = ["node_modules/vite/bin/vite.js", "--config", "tests/browser/vite.config.ts", "--host", "127.0.0.1", "--port", String(port), "--strictPort"];
  await serve("Vite", process.execPath, vite, `${base}/perf/harness.html`);
  if (process.argv.includes("--serve-only")) {
    // Exercises the start path alone (no Safari): `node tests/browser/cross/safari.mjs --serve-only`.
    console.log(`Vite serves ${base}; --serve-only, stopping`);
    throw Object.assign(new Error("serve-only"), { serveOnly: true });
  }
  await serve("safaridriver", "safaridriver", ["-p", String(driverPort)], `${driver}/status`);
  const created = await wd("POST", "/session", { capabilities: { alwaysMatch: { browserName: "safari" } } });
  session = created.sessionId;
  results.safari = { browserName: created.capabilities.browserName, browserVersion: created.capabilities.browserVersion, platformName: created.capabilities.platformName };
  console.log(`Safari ${results.safari.browserVersion} on ${results.safari.platformName}`);
  await wd("POST", `/session/${session}/window/rect`, { x: 0, y: 0, width: 1280, height: 900 });

  await open("/tests/browser/cross/probe.html");
  results.probe = await exec("return P.probe()");
  console.log(`probe: ${JSON.stringify(results.probe, null, 2)}`);
  check("WebGL 2 is available", results.probe.webgl2 !== null, results.probe.webgl2);
  const webgpu = results.probe.threeWebGPURenderer?.webgpuBackend === true;
  const backends = webgpu ? ["webgl", "webgpu"] : ["webgl"];
  if (!webgpu) console.log("WebGPU: three's WebGPURenderer did not land on the WebGPU backend; WebGPU cases not run");

  for (const backend of backends) {
    for (const type of ["sphere", "cube", "rounded-cube"]) {
      try {
        await views(backend, type);
      } catch (error) {
        check(`${backend} ${type}: views`, false, String(error));
      }
    }
    for (const run of [keyboard, navigation, fonts]) {
      try {
        await run(backend);
      } catch (error) {
        check(`${backend} ${run.name}`, false, String(error));
      }
    }
  }
} catch (error) {
  if (!error.serveOnly) {
    console.error(error);
    results.error = String(error);
    failed = true;
  }
} finally {
  if (session) await wd("DELETE", `/session/${session}`).catch(() => {});
  for (const child of children) child.kill();
  mkdirSync(out, { recursive: true });
  writeFileSync(`${out}/safari.json`, `${JSON.stringify(results, null, 2)}\n`);
}
const failures = results.checks.filter((c) => c.ok === false);
const blocked = results.checks.filter((c) => c.ok === null).length;
const knownCount = results.checks.filter((c) => c.ok === "known").length;
console.log(`\n${results.checks.length - failures.length - blocked - knownCount} passed, ${failures.length} failed, ${knownCount} known, ${blocked} blocked`);
process.exit(failed || failures.length ? 1 : 0);
