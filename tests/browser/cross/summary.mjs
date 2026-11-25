#!/usr/bin/env node
/**
 * Writes the P13 cross-browser evidence of one job as Markdown: per-project pass, fail, flaky and skip counts with the
 * failing titles from Playwright JSON reports, then every `adapter.json`, `axe.json`, `safari.json` and
 * `voiceover.json` found under the given directories. Appends to `$GITHUB_STEP_SUMMARY` when set, else prints.
 *
 * Usage: node tests/browser/cross/summary.mjs <title> <dir-or-report.json>...
 */
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const [title = "P13 cross-browser", ...inputs] = process.argv.slice(2);
const lines = [`## ${title}`, ""];

const files = (path) => {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(path, e.name)) : [join(path, e.name)]));
};
const all = inputs.flatMap(files);
const read = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};

/** Playwright JSON report: counts per project and the titles that did not pass. */
const reports = all.filter((f) => /report\.json$|browser\.json$/.test(f)).map((f) => [f, read(f)]).filter(([, r]) => r?.suites);
for (const [file, report] of reports) {
  const counts = new Map();
  const failing = [];
  const walk = (suite, path) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        const c = counts.get(t.projectName) ?? { passed: 0, failed: 0, flaky: 0, skipped: 0 };
        const key = { expected: "passed", unexpected: "failed", flaky: "flaky", skipped: "skipped" }[t.status] ?? "failed";
        c[key]++;
        counts.set(t.projectName, c);
        if (key === "failed" || key === "flaky") {
          const error = t.results?.at(-1)?.error?.message?.split("\n")[0]?.replace(/\u001b\[[0-9;]*m/g, "").slice(0, 200) ?? "";
          failing.push(`- ${key} [${t.projectName}] ${[...path, spec.title].join(" › ")} (${spec.file}:${spec.line})${error ? `: ${error}` : ""}`);
        }
      }
    }
    for (const child of suite.suites ?? []) walk(child, [...path, child.title]);
  };
  for (const suite of report.suites) walk(suite, []);
  lines.push(`### ${file}`, "", "| project | passed | failed | flaky | skipped |", "| --- | --- | --- | --- | --- |");
  for (const [project, c] of counts) lines.push(`| ${project} | ${c.passed} | ${c.failed} | ${c.flaky} | ${c.skipped} |`);
  // Errors outside any test (config, collection, web server, global timeout) fail a run with no failed test.
  const runner = (report.errors ?? []).map(
    (e) => `- runner error: ${(e.message ?? e.value ?? JSON.stringify(e)).split("\n")[0].replace(/\u001b\[[0-9;]*m/g, "").slice(0, 300)}`
  );
  lines.push("", ...(failing.length || runner.length ? [...failing, ...runner] : ["No failures."]), "");
}

for (const file of all.filter((f) => /adapter\.json$/.test(f))) {
  const a = read(file);
  if (!a) continue;
  const gpu = a.webgpu ?? {};
  const adapter = gpu.highPerformance ?? gpu.lowPower;
  lines.push(
    `### Adapter: ${a.browserName} ${a.browserVersion} (${file})`,
    "",
    `- WebGL 2: ${a.webgl2 ? `${a.webgl2.vendor} / ${a.webgl2.renderer}` : "none"}`,
    `- WebGPU: ${gpu.available ? `${adapter.vendor} / ${adapter.architecture} / ${adapter.device || "-"} / ${adapter.description || "-"}, fallback adapter: ${adapter.isFallbackAdapter}` : `none (${gpu.reason ?? "no adapter"})`}`,
    `- three WebGPURenderer on the WebGPU backend: ${JSON.stringify(a.threeWebGPURenderer)}`,
    ""
  );
}

for (const file of all.filter((f) => /axe\.json$/.test(f))) {
  const a = read(file);
  if (!a) continue;
  lines.push(`### axe ${a.axe}: ${a.page}`, "");
  if (!a.violations.length) lines.push("No violations.");
  for (const v of a.violations) lines.push(`- **${v.id}** (${v.impact}): ${v.help}; ${v.nodes.length} node(s): ${v.nodes.slice(0, 5).join(", ")}${v.first ? `; first: ${v.first.replace(/\s+/g, " ")}` : ""}`);
  if (a.incomplete.length) lines.push(`- needs review: ${a.incomplete.map((v) => `${v.id} (${v.nodes})`).join(", ")}`);
  lines.push("");
}

for (const file of all.filter((f) => /safari\.json$/.test(f))) {
  const s = read(file);
  if (!s) continue;
  const failed = s.checks.filter((c) => c.ok === false);
  const blocked = s.checks.filter((c) => c.ok === null);
  lines.push(`### Safari ${s.safari?.browserVersion ?? "?"} (${s.safari?.platformName ?? "?"}): ${s.checks.length - failed.length - blocked.length} passed, ${failed.length} failed, ${blocked.length} blocked by the driver`, "");
  for (const c of s.checks) lines.push(`- ${c.ok ? "pass" : c.ok === null ? "blocked" : "**FAIL**"} ${c.name}${c.ok ? "" : c.ok === null ? `: ${c.blocked}` : `: ${JSON.stringify(c.detail)}`}`);
  if (s.fonts) lines.push(`- fonts: ${JSON.stringify(s.fonts)}`);
  if (s.error) lines.push(`- **error**: ${s.error}`);
  lines.push("", "```json", JSON.stringify(s.probe, null, 2), "```", "");
}

for (const file of all.filter((f) => /voiceover\.json$/.test(f))) {
  const steps = read(file);
  if (!steps) continue;
  lines.push(`### VoiceOver transcript (${file})`, "");
  for (const s of steps) lines.push(`- ${s.step}: ${s.spoken.map((p) => `"${p}"`).join(", ") || "(nothing)"}; page: name "${s.state?.name}", status "${s.state?.status}", focus ${s.state?.focused}`);
  lines.push("");
}

const markdown = `${lines.join("\n")}\n`;
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);
