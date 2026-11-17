import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { blocking } from '../scripts/audit.mjs';

const report = (...advisories) => ({
  vulnerabilities: { pkg: { via: ['other-pkg', ...advisories] } },
});
const advisory = (id, severity) => ({ url: `https://github.com/advisories/${id}`, severity, name: 'pkg', title: 't' });

test('an allowlisted advisory does not block', () => {
  assert.deepEqual(blocking(report(advisory('GHSA-fc5q-39xc-vjpf', 'high'))), []);
});

test('any other high or critical advisory blocks; moderate does not', () => {
  const found = blocking(report(advisory('GHSA-aaaa', 'high'), advisory('GHSA-bbbb', 'critical'), advisory('GHSA-cccc', 'moderate')));
  assert.equal(found.length, 2);
});

// The entrypoint, run from a checkout path with a space, against a stub `npm` on PATH.
test('runs the audit when its path contains a space', { skip: process.platform === 'win32' }, (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'audit with space '));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const script = path.join(dir, 'scripts', 'audit.mjs');
  mkdirSync(path.dirname(script));
  copyFileSync(fileURLToPath(new URL('../scripts/audit.mjs', import.meta.url)), script);
  const bin = path.join(dir, 'bin');
  mkdirSync(bin);
  const stub = (body) => {
    writeFileSync(path.join(bin, 'npm'), `#!/bin/sh\ncat <<'JSON'\n${JSON.stringify(body)}\nJSON\nexit 1\n`);
    chmodSync(path.join(bin, 'npm'), 0o755);
    return spawnSync(process.execPath, [script], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}` },
    });
  };
  const blocked = stub(report(advisory('GHSA-aaaa', 'critical')));
  assert.equal(blocked.status, 1, blocked.stderr);
  assert.match(blocked.stderr, /critical pkg: t \(GHSA-aaaa\)/);
  const allowed = stub(report(advisory('GHSA-fc5q-39xc-vjpf', 'high')));
  assert.equal(allowed.status, 0, allowed.stderr);
  assert.match(allowed.stdout, /npm audit: 0 blocking/);
});
