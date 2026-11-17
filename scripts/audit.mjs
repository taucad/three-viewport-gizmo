#!/usr/bin/env node
// `npm audit --audit-level=high` with a short allowlist for advisories that have no patched release and reach dev
// tooling only. Each entry says why and when; remove it once a fix ships (an `overrides` pin then takes its place).
import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ALLOWED = {
  // Operator ruling 2026-11-17. picomatch ReDoS via repeated extglobs: every version (<= 4.0.7) affected, none patched.
  // Reaches only vite, vitest and nx at build and test time; the published package has no dependencies.
  'GHSA-fc5q-39xc-vjpf': 'picomatch',
};

/** The high and critical advisories in an `npm audit --json` report that are not allowlisted. */
export function blocking(report, allowed = ALLOWED) {
  const found = new Map();
  for (const { via } of Object.values(report.vulnerabilities ?? {})) {
    for (const advisory of via) {
      if (typeof advisory !== 'object' || !['high', 'critical'].includes(advisory.severity)) continue;
      const id = advisory.url.split('/').pop();
      if (!(id in allowed)) found.set(id, `${advisory.severity} ${advisory.name}: ${advisory.title} (${id})`);
    }
  }
  return [...found.values()];
}

/** Whether this module is the process entrypoint, by real path (a space in a checkout path is `%20` in the URL). */
function isMain() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(path.resolve(process.argv[1]));
  } catch {
    return false;
  }
}

if (isMain()) {
  const { stdout } = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8' });
  const found = blocking(JSON.parse(stdout));
  for (const line of found) console.error(line);
  console.log(`npm audit: ${found.length} blocking high or critical advisories; allowlisted: ${Object.keys(ALLOWED).join(', ')}`);
  process.exit(found.length ? 1 : 0);
}
